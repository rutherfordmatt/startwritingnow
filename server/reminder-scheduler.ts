import cron from 'node-cron';
import { db } from './db';
import { users, prompts, entries } from '@shared/schema';
import { eq, and, isNotNull, gte, sql } from 'drizzle-orm';
import { sendReminderEmail, sendWeeklySummaryEmail } from './email';
import { format } from 'date-fns-tz';
import { subDays, startOfDay } from 'date-fns';

function getAppUrl(): string {
  // In production, REPLIT_DOMAINS contains the deployed domain(s)
  // REPLIT_DEV_DOMAIN is NOT available in production deployments
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',');
    // Prefer custom domain (one that doesn't contain 'replit' at all)
    const customDomain = domains.find(d => !d.includes('replit'));
    const domain = customDomain || domains[0];
    return `https://${domain}`;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return 'http://localhost:5000';
}

const APP_URL = getAppUrl();

function getDisplayName(user: { firstName?: string | null; username: string; email?: string | null }): string {
  if (user.firstName) {
    return user.firstName;
  }
  const emailOrUsername = user.email || user.username;
  const localPart = emailOrUsername.split('@')[0];
  const firstName = localPart.split(/[._-]/)[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

async function getRandomPrompt(): Promise<{ id: number; content: string }> {
  const allPrompts = await db.select().from(prompts);
  if (allPrompts.length === 0) {
    return { id: 0, content: "What's on your mind today?" };
  }
  const prompt = allPrompts[Math.floor(Math.random() * allPrompts.length)];
  return { id: prompt.id, content: prompt.content };
}

async function sendReminders(): Promise<void> {
  const usersWithReminders = await db.select()
    .from(users)
    .where(
      and(
        eq(users.reminderEnabled, true),
        eq(users.isEmailVerified, true),
        isNotNull(users.email)
      )
    );

  if (usersWithReminders.length === 0) {
    return;
  }

  const now = new Date();
  
  for (const user of usersWithReminders) {
    if (!user.email || !user.reminderTime || !user.reminderTimezone) {
      console.log(`Skipping user ${user.id}: missing email/time/timezone`);
      continue;
    }
    
    try {
      // Format current UTC time directly to user's timezone - no double conversion
      const userCurrentTime = format(now, 'HH:mm', { timeZone: user.reminderTimezone });
      
      // Log every minute check for debugging (will help diagnose timing issues)
      console.log(`[Reminder Check] User: ${user.email}, Their time: ${userCurrentTime}, Target: ${user.reminderTime}, Match: ${userCurrentTime === user.reminderTime}`);
      
      if (userCurrentTime === user.reminderTime) {
        // Check if we already sent a reminder today (within last 23 hours to avoid edge cases)
        if (user.lastReminderSentAt) {
          const hoursSinceLastReminder = (now.getTime() - new Date(user.lastReminderSentAt).getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastReminder < 23) {
            continue; // Already sent today, skip
          }
        }
        
        const prompt = await getRandomPrompt();
        const success = await sendReminderEmail({
          to: user.email,
          username: getDisplayName(user),
          promptContent: prompt.content,
          promptId: prompt.id,
          appUrl: APP_URL,
        });
        
        if (success) {
          // Update last reminder sent timestamp to prevent duplicates
          await db.update(users)
            .set({ lastReminderSentAt: now })
            .where(eq(users.id, user.id));
          console.log(`Reminder sent to ${user.email} at their local time ${user.reminderTime} (${user.reminderTimezone})`);
        } else {
          console.error(`Failed to send reminder to ${user.email}`);
        }
      }
    } catch (error) {
      console.error(`Error processing reminder for user ${user.id}:`, error);
    }
  }
}

// Weekly summary sending time (6 PM / 18:00 on Sundays in user's timezone)
const WEEKLY_SUMMARY_TIME = '18:00';

async function sendWeeklySummaries(): Promise<void> {
  // Get users with verified emails who haven't disabled summaries
  const eligibleUsers = await db.select()
    .from(users)
    .where(
      and(
        eq(users.isEmailVerified, true),
        isNotNull(users.email)
      )
    );

  if (eligibleUsers.length === 0) {
    return;
  }

  const now = new Date();
  const oneWeekAgo = startOfDay(subDays(now, 7));
  
  for (const user of eligibleUsers) {
    if (!user.email) continue;
    
    // Skip if user has disabled weekly summaries
    if (user.weeklySummaryEnabled === false) continue;
    
    try {
      const timezone = user.reminderTimezone || 'America/New_York';
      
      // Check if it's Sunday 6 PM in user's timezone
      // Use 'i' for ISO day of week (1=Monday, 7=Sunday)
      const userCurrentTime = format(now, 'HH:mm', { timeZone: timezone });
      const userCurrentDayISO = parseInt(format(now, 'i', { timeZone: timezone })); // 1-7, Sunday=7
      const isSunday = userCurrentDayISO === 7;
      
      if (!isSunday || userCurrentTime !== WEEKLY_SUMMARY_TIME) {
        continue;
      }
      
      // Check if we already sent a summary this week (within last 6 days to avoid edge cases)
      if (user.lastWeeklySummaryAt) {
        const daysSinceLastSummary = Math.floor((now.getTime() - new Date(user.lastWeeklySummaryAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastSummary < 6) {
          continue;
        }
      }
      
      // Get user's entries from the past 7 days
      const weeklyEntries = await db.select()
        .from(entries)
        .where(
          and(
            eq(entries.userId, user.id),
            gte(entries.createdAt, oneWeekAgo)
          )
        );
      
      // Get total entries count
      const allEntries = await db.select()
        .from(entries)
        .where(eq(entries.userId, user.id));
      
      const entriesThisWeek = weeklyEntries.length;
      const wordsThisWeek = weeklyEntries.reduce((sum, e) => sum + e.wordCount, 0);
      const totalEntries = allEntries.length;
      
      // Calculate current streak by counting unique consecutive days
      let currentStreak = 0;
      
      if (allEntries.length > 0) {
        // Get unique dates (dedupe entries on same day)
        const uniqueDates = [...new Set(
          allEntries.map(e => startOfDay(new Date(e.createdAt)).getTime())
        )].sort((a, b) => b - a); // Sort descending (most recent first)
        
        const today = startOfDay(now);
        const todayTime = today.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        // Check if most recent entry is today or yesterday to start counting
        const mostRecentDate = uniqueDates[0];
        const daysSinceMostRecent = Math.round((todayTime - mostRecentDate) / oneDayMs);
        
        if (daysSinceMostRecent <= 1) {
          // Start counting from most recent date
          let expectedDate = mostRecentDate;
          
          for (const dateTime of uniqueDates) {
            if (dateTime === expectedDate) {
              currentStreak++;
              expectedDate -= oneDayMs; // Move to previous day
            } else if (dateTime < expectedDate) {
              // Gap in streak, stop counting
              break;
            }
            // If dateTime > expectedDate, skip (shouldn't happen with sorted desc)
          }
        }
      }
      
      const success = await sendWeeklySummaryEmail({
        to: user.email,
        username: getDisplayName(user),
        appUrl: APP_URL,
        entriesThisWeek,
        wordsThisWeek,
        currentStreak,
        totalEntries,
      });
      
      if (success) {
        // Update last summary sent timestamp
        await db.update(users)
          .set({ lastWeeklySummaryAt: now })
          .where(eq(users.id, user.id));
        console.log(`Weekly summary sent to ${user.email} (${timezone})`);
      } else {
        console.error(`Failed to send weekly summary to ${user.email}`);
      }
    } catch (error) {
      console.error(`Error processing weekly summary for user ${user.id}:`, error);
    }
  }
}

export function startReminderScheduler(): void {
  cron.schedule('* * * * *', async () => {
    await sendReminders();
    await sendWeeklySummaries();
  });

  console.log('Reminder scheduler started - checking every minute');
}

export async function sendTestReminder(userId: string): Promise<{ success: boolean; reason?: string }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user || !user.email) {
    return { success: false, reason: "no_email" };
  }
  
  if (!user.isEmailVerified) {
    return { success: false, reason: "not_verified" };
  }

  const prompt = await getRandomPrompt();
  const sent = await sendReminderEmail({
    to: user.email,
    username: getDisplayName(user),
    promptContent: prompt.content,
    promptId: prompt.id,
    appUrl: APP_URL,
  });
  
  return { success: sent };
}

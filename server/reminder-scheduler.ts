import cron from 'node-cron';
import { db } from './db';
import { users, prompts } from '@shared/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendReminderEmail } from './email';
import { format } from 'date-fns-tz';

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
    if (!user.email || !user.reminderTime || !user.reminderTimezone) continue;
    
    try {
      // Format current UTC time directly to user's timezone - no double conversion
      const userCurrentTime = format(now, 'HH:mm', { timeZone: user.reminderTimezone });
      
      if (userCurrentTime === user.reminderTime) {
        const prompt = await getRandomPrompt();
        const success = await sendReminderEmail({
          to: user.email,
          username: getDisplayName(user),
          promptContent: prompt.content,
          promptId: prompt.id,
          appUrl: APP_URL,
        });
        
        if (success) {
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

export function startReminderScheduler(): void {
  cron.schedule('* * * * *', async () => {
    await sendReminders();
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

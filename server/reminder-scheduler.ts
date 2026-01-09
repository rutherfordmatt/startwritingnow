import cron from 'node-cron';
import { db } from './db';
import { users, prompts } from '@shared/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendReminderEmail } from './email';
import { toZonedTime, format } from 'date-fns-tz';

const APP_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.REPLIT_DEPLOYMENT_URL 
    ? `https://${process.env.REPLIT_DEPLOYMENT_URL}`
    : 'http://localhost:5000';

async function getRandomPrompt(): Promise<string> {
  const allPrompts = await db.select().from(prompts);
  if (allPrompts.length === 0) {
    return "What's on your mind today?";
  }
  return allPrompts[Math.floor(Math.random() * allPrompts.length)].content;
}

async function sendReminders(): Promise<void> {
  const usersWithReminders = await db.select()
    .from(users)
    .where(
      and(
        eq(users.reminderEnabled, true),
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
      const userLocalTime = toZonedTime(now, user.reminderTimezone);
      const userCurrentTime = format(userLocalTime, 'HH:mm', { timeZone: user.reminderTimezone });
      
      if (userCurrentTime === user.reminderTime) {
        const prompt = await getRandomPrompt();
        const success = await sendReminderEmail({
          to: user.email,
          username: user.firstName || user.username,
          prompt,
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

export async function sendTestReminder(userId: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user || !user.email) {
    return false;
  }

  const prompt = await getRandomPrompt();
  return sendReminderEmail({
    to: user.email,
    username: user.firstName || user.username,
    prompt,
    appUrl: APP_URL,
  });
}

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderEmailData {
  to: string;
  username: string;
  promptContent: string;
  promptId: number;
  appUrl: string;
}

interface WeeklySummaryEmailData {
  to: string;
  username: string;
  appUrl: string;
  entriesThisWeek: number;
  wordsThisWeek: number;
  currentStreak: number;
  totalEntries: number;
}

const FRIENDLY_GREETINGS = [
  "Time to reflect!",
  "Your daily moment of clarity awaits",
  "Ready to write?",
  "A fresh page is waiting for you",
  "Let's capture today's thoughts",
];

interface VerificationEmailData {
  to: string;
  username: string;
  verificationUrl: string;
}

interface WelcomeEmailData {
  to: string;
  username: string;
  appUrl: string;
}

interface GoodbyeEmailData {
  to: string;
  username: string;
}

export async function sendVerificationEmail({ to, username, verificationUrl }: VerificationEmailData): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'startwriting.now <noreply@startwriting.now>',
      to: [to],
      subject: 'Verify your email - startwriting.now',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Verify your email</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">One quick step to get started</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 20px 0; color: #666;">Hi ${username},</p>
            <p style="margin: 0 0 20px 0; color: #666;">Thanks for signing up! Please verify your email address to start your journaling journey.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email</a>
            </div>
            
            <p style="margin: 25px 0 0 0; color: #888; font-size: 14px; text-align: center;">
              This link expires in 24 hours.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail({ to, username, appUrl }: WelcomeEmailData): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'startwriting.now <noreply@startwriting.now>',
      to: [to],
      subject: 'Welcome to startwriting.now!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome, ${username}!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your journaling journey begins now</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 20px 0; color: #666;">You're all set to start writing! Here's how to get the most out of your micro-journaling practice:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">3-Minute Sessions</h3>
              <p style="margin: 0; color: #666;">Each writing session is designed to be quick and focused. Just 3 minutes a day can transform your clarity.</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Daily Prompts</h3>
              <p style="margin: 0; color: #666;">Get inspired with fresh prompts covering Life and Career topics. Skip any that don't resonate.</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Build Your Streak</h3>
              <p style="margin: 0; color: #666;">Write consistently to build a streak. Enable daily reminders in your dashboard to stay on track.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Your First Entry</a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">Happy writing!</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendGoodbyeEmail({ to, username }: GoodbyeEmailData): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'startwriting.now <noreply@startwriting.now>',
      to: [to],
      subject: 'Sorry to see you go - startwriting.now',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Goodbye, ${username}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We're sorry to see you go</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 20px 0; color: #666;">Your account and all journal entries have been permanently deleted as requested.</p>
            
            <p style="margin: 0 0 20px 0; color: #666;">We hope your time with startwriting.now was valuable. If you ever want to return, we'll be here.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-style: italic;">"Every ending is a new beginning."</p>
            </div>
            
            <p style="margin: 0; color: #666;">Take care and keep writing, wherever life takes you.</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">Thank you for being part of our community.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send goodbye email:', error);
    return false;
  }
}

export async function sendReminderEmail({ to, username, promptContent, promptId, appUrl }: ReminderEmailData): Promise<boolean> {
  const greeting = FRIENDLY_GREETINGS[Math.floor(Math.random() * FRIENDLY_GREETINGS.length)];
  const writeUrl = promptId > 0 ? `${appUrl}?prompt=${promptId}` : appUrl;
  
  try {
    await resend.emails.send({
      from: 'startwriting.now <noreply@startwriting.now>',
      to: [to],
      subject: `${greeting} - Your Daily Journal Prompt`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Hey ${username}!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${greeting}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 20px 0; color: #666;">Here's your prompt for today:</p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
              <p style="margin: 0; font-size: 18px; color: #333; font-style: italic;">"${promptContent}"</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${writeUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Writing</a>
            </div>
            
            <p style="margin: 25px 0 0 0; color: #888; font-size: 14px; text-align: center;">
              Take 3 minutes to reflect. Your future self will thank you.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">You're receiving this because you enabled daily reminders.</p>
            <p style="margin: 5px 0 0 0;">To stop these emails, update your settings in the app.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return false;
  }
}

const WEEKLY_SUMMARY_SUBJECTS = [
  "Your week in writing",
  "Weekly writing recap",
  "Your journaling week in review",
  "This week's writing journey",
];

export async function sendWeeklySummaryEmail({ 
  to, 
  username, 
  appUrl, 
  entriesThisWeek, 
  wordsThisWeek, 
  currentStreak,
  totalEntries 
}: WeeklySummaryEmailData): Promise<boolean> {
  const subject = WEEKLY_SUMMARY_SUBJECTS[Math.floor(Math.random() * WEEKLY_SUMMARY_SUBJECTS.length)];
  
  const getStreakMessage = () => {
    if (currentStreak >= 7) return `Amazing! You're on a ${currentStreak}-day streak. Keep it going!`;
    if (currentStreak > 0) return `You're on a ${currentStreak}-day streak. A few more days to reach 7!`;
    return "Start a new streak this week!";
  };
  
  const getEncouragement = () => {
    if (entriesThisWeek >= 7) return "Perfect week! You wrote every single day.";
    if (entriesThisWeek >= 5) return "Great consistency this week!";
    if (entriesThisWeek >= 3) return "Solid effort! A few more entries next week?";
    if (entriesThisWeek >= 1) return "You showed up this week. That matters.";
    return "This week is a fresh start. Just 3 minutes can make a difference.";
  };

  try {
    await resend.emails.send({
      from: 'startwriting.now <noreply@startwriting.now>',
      to: [to],
      subject: `${subject} - startwriting.now`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your Week in Review</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Hey ${username}, here's how you did!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <!-- Stats Grid -->
            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
              <div style="flex: 1; background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #667eea;">${entriesThisWeek}</div>
                <div style="font-size: 12px; color: #888; text-transform: uppercase;">Entries</div>
              </div>
              <div style="flex: 1; background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #667eea;">${wordsThisWeek.toLocaleString()}</div>
                <div style="font-size: 12px; color: #888; text-transform: uppercase;">Words</div>
              </div>
              <div style="flex: 1; background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #f97316;">${currentStreak}</div>
                <div style="font-size: 12px; color: #888; text-transform: uppercase;">Day Streak</div>
              </div>
            </div>
            
            <!-- Streak Message -->
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 20px;">
              <p style="margin: 0; color: #666;">${getStreakMessage()}</p>
            </div>
            
            <!-- Encouragement -->
            <p style="margin: 0 0 25px 0; color: #666; font-size: 15px;">${getEncouragement()}</p>
            
            <!-- All-time stat -->
            <p style="margin: 0 0 25px 0; color: #888; font-size: 14px; text-align: center;">
              You've written <strong>${totalEntries}</strong> journal entries in total.
            </p>
            
            <div style="text-align: center;">
              <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start This Week Strong</a>
            </div>
          </div>
          
          <div style="background: #1a1a2e; padding: 25px; border-radius: 12px; margin-top: 20px; text-align: center;">
            <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Get better at work. Every week.</p>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 15px 0;">One email. Practical tools. Real progress.</p>
            <a href="https://mattrutherford.co.uk" style="display: inline-block; background: #fff; color: #1a1a2e; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Join the Newsletter</a>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">You're receiving this weekly summary because you have an active account.</p>
            <p style="margin: 5px 0 0 0;">Keep writing, keep growing.</p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send weekly summary email:', error);
    return false;
  }
}

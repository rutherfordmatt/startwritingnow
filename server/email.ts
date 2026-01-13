import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderEmailData {
  to: string;
  username: string;
  prompt: string;
  appUrl: string;
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

export async function sendReminderEmail({ to, username, prompt, appUrl }: ReminderEmailData): Promise<boolean> {
  const greeting = FRIENDLY_GREETINGS[Math.floor(Math.random() * FRIENDLY_GREETINGS.length)];
  
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
              <p style="margin: 0; font-size: 18px; color: #333; font-style: italic;">"${prompt}"</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Writing</a>
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

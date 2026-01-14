import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api, updateReminderSettingsSchema } from "@shared/routes";
import { insertEntrySchema } from "@shared/schema";
import { z } from "zod";
import { startReminderScheduler, sendTestReminder } from "./reminder-scheduler";
import { sendVerificationEmail, sendWelcomeEmail, sendGoodbyeEmail } from "./email";

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

const ADMIN_EMAILS = ["matt.rutherford@gmail.com"];

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
}

const SEED_PROMPTS = [
  // Life
  { category: "Life", content: "What is a small moment today that brought you joy?" },
  { category: "Life", content: "What is something you are grateful for right now?" },
  { category: "Life", content: "Describe a person who has positively influenced your life." },
  { category: "Life", content: "What is a fear you would like to overcome?" },
  { category: "Life", content: "What does your ideal morning look like?" },
  { category: "Life", content: "If you could talk to your younger self, what would you say?" },
  { category: "Life", content: "What is a habit you want to build?" },
  { category: "Life", content: "Describe your favorite place in the world." },
  { category: "Life", content: "What made you laugh today?" },
  { category: "Life", content: "What is a lesson you learned the hard way?" },
  // ... adding more to reach ~20
  { category: "Life", content: "How do you recharge your energy?" },
  { category: "Life", content: "What is a book or movie that changed your perspective?" },
  { category: "Life", content: "What is something you are looking forward to?" },
  { category: "Life", content: "Who do you miss right now?" },
  { category: "Life", content: "What is your definition of success?" },

  // Career
  { category: "Career", content: "What is a professional achievement you are proud of?" },
  { category: "Career", content: "What is a skill you want to develop this year?" },
  { category: "Career", content: "Describe your ideal work environment." },
  { category: "Career", content: "What is a challenge you are currently facing at work?" },
  { category: "Career", content: "Who is a mentor you admire and why?" },
  { category: "Career", content: "What motivates you to work hard?" },
  { category: "Career", content: "Where do you see yourself in 5 years?" },
  { category: "Career", content: "What is the best career advice you ever received?" },
  { category: "Career", content: "How do you handle stress at work?" },
  { category: "Career", content: "What is a project you are excited about?" },
  // ... adding more
  { category: "Career", content: "What is a mistake you made at work and what did you learn?" },
  { category: "Career", content: "How do you balance work and personal life?" },
  { category: "Career", content: "What is your dream job?" },
  { category: "Career", content: "What value do you bring to your team?" },
  { category: "Career", content: "How do you prefer to receive feedback?" },
];

async function seedPrompts() {
  const existing = await storage.getRandomPrompt();
  if (!existing) {
    console.log("Seeding prompts...");
    for (const prompt of SEED_PROMPTS) {
      await storage.createPrompt(prompt.content, prompt.category);
    }
    // Add even more prompts to reach 100+ would be done here in a real app
    // For now, I'll duplicate the list with slight variations or just loop to simulate volume
    // But 30 is good for a start.
    console.log("Prompts seeded.");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed data
  seedPrompts();
  
  // Start reminder scheduler
  startReminderScheduler();

  // API Routes
  
  // Get Random Prompt
  app.get(api.prompts.random.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const prompt = await storage.getRandomPrompt(category);
    if (!prompt) {
       // Fallback if DB is empty
       return res.json({ id: 0, content: "Write about whatever is on your mind.", category: "Life" });
    }
    res.json(prompt);
  });

  // Get Prompt by ID
  app.get("/api/prompts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    const prompt = await storage.getPromptById(id);
    if (!prompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    res.json(prompt);
  });

  // Create Entry (Protected)
  app.post(api.entries.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertEntrySchema.parse(req.body);
      const userId = req.user!.id;
      
      const entry = await storage.createEntry({ ...input, userId });
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error creating entry:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // List Entries (Protected)
  app.get(api.entries.list.path, isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const entries = await storage.getUserEntries(userId);
    res.json(entries);
  });

  // Get Streak (Protected)
  app.get(api.entries.streak.path, isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const streakInfo = await storage.getStreak(userId);
    res.json(streakInfo);
  });

  // Delete Entry (Protected)
  app.delete(api.entries.delete.path, isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const entryId = parseInt(req.params.id, 10);
    
    if (isNaN(entryId)) {
      return res.status(400).json({ message: "Invalid entry ID" });
    }
    
    const deleted = await storage.deleteEntry(entryId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.status(204).send();
  });

  // Reminder Settings Routes
  
  // Get Reminder Settings (Protected)
  app.get(api.reminders.get.path, isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const settings = await storage.getReminderSettings(userId);
    if (!settings) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(settings);
  });

  // Update Reminder Settings (Protected)
  app.patch(api.reminders.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const input = updateReminderSettingsSchema.parse(req.body);
      const settings = await storage.updateReminderSettings(userId, input);
      if (!settings) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error updating reminder settings:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Send Test Reminder (Protected)
  app.post(api.reminders.test.path, isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const result = await sendTestReminder(userId);
    if (result.success) {
      res.json({ success: true, message: "Test reminder sent! Check your email." });
    } else if (result.reason === "not_verified") {
      res.json({ success: false, message: "Please verify your email first to receive reminders." });
    } else {
      res.json({ success: false, message: "Failed to send. Make sure you have an email set." });
    }
  });

  // User Account Management
  
  // Delete own account
  app.delete("/api/user/account", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const user = req.user as unknown as { firstName?: string | null; username: string; email?: string | null };
    const username = getDisplayName(user);
    
    try {
      const deleted = await storage.deleteUser(userId);
      if (deleted) {
        if (userEmail) {
          sendGoodbyeEmail({ to: userEmail, username }).catch(err => {
            console.error("Failed to send goodbye email:", err);
          });
        }
        req.logout((logoutErr) => {
          if (logoutErr) {
            console.error("Logout error:", logoutErr);
          }
          req.session.destroy((sessionErr) => {
            if (sessionErr) {
              console.error("Session destroy error:", sessionErr);
            }
            res.clearCookie("connect.sid");
            res.json({ success: true, message: "Account deleted successfully" });
          });
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Admin Routes
  
  // Get Admin Stats (Admin only)
  app.get(api.admin.stats.path, isAdmin, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  // Get All Users (Admin only)
  app.get(api.admin.users.path, isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithFormattedDates = users.map(u => ({
      ...u,
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      lastEntryDate: u.lastEntryDate ? u.lastEntryDate.toISOString() : null,
    }));
    res.json(usersWithFormattedDates);
  });

  // Delete User (Admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    const userId = req.params.id;
    
    if (userId === req.user!.id) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }
    
    try {
      const deleted = await storage.deleteUser(userId);
      if (deleted) {
        res.json({ success: true, message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Email Verification Routes
  
  // Get verification status
  app.get("/api/auth/email/status", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const isVerified = await storage.isEmailVerified(userId);
    res.json({ isVerified });
  });
  
  // Send/resend verification email
  app.post("/api/auth/email/send-verification", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const settings = await storage.getReminderSettings(userId);
    
    if (!settings?.email) {
      return res.status(400).json({ message: "No email address set. Please update your email in settings." });
    }
    
    const isVerified = await storage.isEmailVerified(userId);
    if (isVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await storage.setVerificationToken(userId, token, expiresAt);
    
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
    const success = await sendVerificationEmail({
      to: settings.email,
      username: getDisplayName({ username: settings.email, email: settings.email }),
      verificationUrl,
    });
    
    if (success) {
      res.json({ success: true, message: "Verification email sent! Check your inbox." });
    } else {
      res.status(500).json({ success: false, message: "Failed to send verification email. Please try again." });
    }
  });
  
  // Verify email with token
  app.post("/api/auth/email/verify", async (req, res) => {
    const { token } = req.body;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }
    
    const result = await storage.verifyEmailByToken(token);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });
    }
    
    const settings = await storage.getReminderSettings(result.userId!);
    if (settings?.email) {
      await sendWelcomeEmail({
        to: settings.email,
        username: getDisplayName({ username: settings.email, email: settings.email }),
        appUrl: APP_URL,
      });
      await storage.markWelcomeEmailSent(result.userId!);
    }
    
    res.json({ success: true, message: "Email verified successfully! Welcome aboard." });
  });

  return httpServer;
}

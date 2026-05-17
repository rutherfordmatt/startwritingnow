import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./auth";
import { api, updateReminderSettingsSchema, updateWordGoalSchema, updateEntryMoodSchema } from "@shared/routes";
import { insertEntrySchema, MOOD_OPTIONS, voteFeatureSchema, suggestFeatureSchema } from "@shared/schema";
import { z } from "zod";
import { startReminderScheduler, sendTestReminder } from "./reminder-scheduler";
import { sendVerificationEmail, sendWelcomeEmail, sendGoodbyeEmail } from "./email";
import { getAppUrl } from "./app-url";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

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
  { category: "Career", content: "What is a mistake you made at work and what did you learn?" },
  { category: "Career", content: "How do you balance work and personal life?" },
  { category: "Career", content: "What is your dream job?" },
  { category: "Career", content: "What value do you bring to your team?" },
  { category: "Career", content: "How do you prefer to receive feedback?" },

  // Creativity
  { category: "Creativity", content: "If you could create anything without limitations, what would it be?" },
  { category: "Creativity", content: "Describe a color without using its name." },
  { category: "Creativity", content: "What does your inner world look like?" },
  { category: "Creativity", content: "Write about an ordinary object as if seeing it for the first time." },
  { category: "Creativity", content: "If your emotions were a landscape, what would you see?" },
  { category: "Creativity", content: "What would you build if you had unlimited resources?" },
  { category: "Creativity", content: "Describe a sound that makes you feel alive." },
  { category: "Creativity", content: "If you could live inside any artwork, which would you choose?" },
  { category: "Creativity", content: "Write a letter to your future creative self." },
  { category: "Creativity", content: "What inspires you to create?" },
  { category: "Creativity", content: "Describe your perfect creative sanctuary." },
  { category: "Creativity", content: "If your life were a movie, what genre would it be?" },
  { category: "Creativity", content: "What would you make if no one would ever see it?" },
  { category: "Creativity", content: "Describe the texture of your favorite memory." },
  { category: "Creativity", content: "What story is waiting to be told through you?" },

  // Gratitude
  { category: "Gratitude", content: "What are three things you're grateful for today?" },
  { category: "Gratitude", content: "Who made a difference in your life recently?" },
  { category: "Gratitude", content: "What simple pleasure brought you joy this week?" },
  { category: "Gratitude", content: "What part of your daily routine are you thankful for?" },
  { category: "Gratitude", content: "Name something about your body you appreciate." },
  { category: "Gratitude", content: "What challenge helped you grow?" },
  { category: "Gratitude", content: "What technology are you grateful exists?" },
  { category: "Gratitude", content: "Who believed in you when you needed it most?" },
  { category: "Gratitude", content: "What skill do you have that you're thankful for?" },
  { category: "Gratitude", content: "What memory always makes you smile?" },
  { category: "Gratitude", content: "What about your home brings you comfort?" },
  { category: "Gratitude", content: "What opportunity are you grateful for?" },
  { category: "Gratitude", content: "What lesson are you thankful to have learned?" },
  { category: "Gratitude", content: "What in nature fills you with wonder?" },
  { category: "Gratitude", content: "Who has shown you kindness recently?" },

  // Mindfulness
  { category: "Mindfulness", content: "What are you feeling right now, in this moment?" },
  { category: "Mindfulness", content: "Describe five things you can see around you." },
  { category: "Mindfulness", content: "What does your breath feel like right now?" },
  { category: "Mindfulness", content: "What is your body telling you today?" },
  { category: "Mindfulness", content: "What thought keeps returning to your mind?" },
  { category: "Mindfulness", content: "Describe the present moment without judgment." },
  { category: "Mindfulness", content: "What can you hear if you listen carefully?" },
  { category: "Mindfulness", content: "How does stillness feel to you?" },
  { category: "Mindfulness", content: "What would letting go look like for you?" },
  { category: "Mindfulness", content: "What are you holding onto that no longer serves you?" },
  { category: "Mindfulness", content: "Describe the space between your thoughts." },
  { category: "Mindfulness", content: "What brings you back to the present moment?" },
  { category: "Mindfulness", content: "How are you truly, beyond 'fine' or 'good'?" },
  { category: "Mindfulness", content: "What would self-compassion look like today?" },
  { category: "Mindfulness", content: "If this moment were enough, what would change?" },
];

async function seedPrompts() {
  const existing = await storage.getRandomPrompt();
  if (!existing) {
    console.log("Seeding all prompts...");
    for (const prompt of SEED_PROMPTS) {
      await storage.createPrompt(prompt.content, prompt.category);
    }
    console.log("Prompts seeded.");
  } else {
    // Check if new categories need to be added (for existing databases)
    const categories = ['Creativity', 'Gratitude', 'Mindfulness'];
    for (const category of categories) {
      const categoryPrompt = await storage.getRandomPrompt(category);
      if (!categoryPrompt) {
        console.log(`Seeding ${category} prompts...`);
        const categoryPrompts = SEED_PROMPTS.filter(p => p.category === category);
        for (const prompt of categoryPrompts) {
          await storage.createPrompt(prompt.content, prompt.category);
        }
        console.log(`${category} prompts seeded.`);
      }
    }
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

  // Update Entry Mood (Protected)
  app.patch("/api/entries/:id/mood", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id, 10);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const input = updateEntryMoodSchema.parse(req.body);
      const updated = await storage.updateEntryMood(entryId, userId, input.mood);
      
      if (!updated) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error updating entry mood:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // User Stats for Achievements (Protected)
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entries = await storage.getUserEntries(userId);
      const streakData = await storage.getStreak(userId);
      
      // Calculate stats
      const totalEntries = entries.length;
      const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
      
      // Count by category
      const categoryCounts = {
        Life: 0,
        Career: 0,
        Gratitude: 0,
        Creativity: 0,
        Mindfulness: 0,
      };
      
      for (const entry of entries) {
        if (entry.prompt?.category) {
          const cat = entry.prompt.category as keyof typeof categoryCounts;
          if (cat in categoryCounts) {
            categoryCounts[cat]++;
          }
        }
      }
      
      // Count feature suggestions by this user
      const featureSuggestions = await storage.countFeatureSuggestionsByUser(userId);
      
      res.json({
        totalEntries,
        totalWords,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        featureSuggestions,
        categoryCounts,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Export Entries Routes
  
  // Export as Text (Protected)
  app.get("/api/export/text", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entries = await storage.getUserEntries(userId);
      
      if (entries.length === 0) {
        return res.status(400).json({ message: "No entries to export" });
      }
      
      let textContent = "startwriting.now - Journal Export\n";
      textContent += "=" .repeat(40) + "\n\n";
      
      for (const entry of entries) {
        const date = format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a");
        textContent += `Date: ${date}\n`;
        
        if (entry.prompt) {
          textContent += `Category: ${entry.prompt.category}\n`;
          textContent += `Prompt: ${entry.prompt.content}\n`;
        }
        
        if (entry.mood) {
          const moodOption = MOOD_OPTIONS.find(m => m.value === entry.mood);
          if (moodOption) {
            textContent += `Mood: ${moodOption.label}\n`;
          }
        }
        
        textContent += `Words: ${entry.wordCount}\n`;
        textContent += "\n" + entry.content + "\n";
        textContent += "\n" + "-".repeat(40) + "\n\n";
      }
      
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="journal-export-${format(new Date(), "yyyy-MM-dd")}.txt"`);
      res.send(textContent);
    } catch (err) {
      console.error("Error exporting text:", err);
      res.status(500).json({ message: "Failed to export entries" });
    }
  });
  
  // Export as PDF (Protected)
  app.get("/api/export/pdf", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entries = await storage.getUserEntries(userId);
      
      if (entries.length === 0) {
        return res.status(400).json({ message: "No entries to export" });
      }
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="journal-export-${format(new Date(), "yyyy-MM-dd")}.pdf"`);
      
      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);
      
      // Title
      doc.fontSize(24).font("Helvetica-Bold").text("startwriting.now", { align: "center" });
      doc.fontSize(14).font("Helvetica").text("Journal Export", { align: "center" });
      doc.moveDown(2);
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const date = format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a");
        
        // Add new page if not first entry and approaching bottom
        if (i > 0 && doc.y > 650) {
          doc.addPage();
        } else if (i > 0) {
          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e0e0e0");
          doc.moveDown(1);
        }
        
        // Date
        doc.fontSize(12).font("Helvetica-Bold").text(date);
        
        // Category and prompt
        if (entry.prompt) {
          doc.fontSize(10).font("Helvetica").fillColor("#666666")
            .text(`${entry.prompt.category} - ${entry.prompt.content}`);
        }
        
        // Mood
        if (entry.mood) {
          const moodOption = MOOD_OPTIONS.find(m => m.value === entry.mood);
          if (moodOption) {
            doc.fontSize(10).font("Helvetica").fillColor("#666666")
              .text(`Mood: ${moodOption.label}`);
          }
        }
        
        doc.moveDown(0.5);
        
        // Content
        doc.fontSize(11).font("Helvetica").fillColor("#000000").text(entry.content, {
          align: "left",
          lineGap: 4,
        });
        
        // Word count
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor("#999999").text(`${entry.wordCount} words`);
      }
      
      doc.end();
    } catch (err) {
      console.error("Error exporting PDF:", err);
      res.status(500).json({ message: "Failed to export entries" });
    }
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

  // Word Goal Routes
  
  // Get Word Goal Settings (Protected)
  app.get(api.wordGoal.get.path, isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const settings = await storage.getWordGoalSettings(userId);
    if (!settings) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(settings);
  });

  // Update Word Goal (Protected)
  app.patch(api.wordGoal.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const input = updateWordGoalSchema.parse(req.body);
      const settings = await storage.updateWordGoal(userId, input.dailyWordGoal);
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
      console.error("Error updating word goal:", err);
      res.status(500).json({ message: "Internal Server Error" });
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

  // Feature Voting Routes (Public)
  const INITIAL_FEATURES = [
    { title: "Mood Trends Dashboard", description: "Visualize how your mood changes over weeks/months with interactive charts" },
    { title: "Word Cloud", description: "Visual display of your most-used words and recurring themes" },
    { title: "AI Writing Insights", description: "AI-powered analysis highlighting recurring themes and personal growth patterns" },
    { title: "Favorite Entries", description: "Star entries to revisit your best writing and meaningful moments" },
    { title: "Anonymous Prompt Sharing", description: "Submit your own prompts for others to use anonymously" },
    { title: "Share Achievements", description: "Share milestone badges on social media to celebrate your progress" },
    { title: "Browser Extension", description: "Quick-capture thoughts from anywhere with a browser extension" },
    { title: "Custom Themes", description: "Personalize your writing space with custom color schemes and fonts" },
  ];

  async function seedFeatures() {
    const existing = await storage.getAllFeatures();
    if (existing.length === 0) {
      console.log("Seeding initial features...");
      for (const feature of INITIAL_FEATURES) {
        await storage.createFeature({ ...feature, isUserSuggested: false });
      }
      console.log("Features seeded.");
    }
  }
  
  seedFeatures();

  // Get all features
  app.get("/api/features", async (req, res) => {
    const allFeatures = await storage.getAllFeatures();
    const visitorId = req.query.visitorId as string | undefined;
    
    let votes: { featureId: number; voteType: string }[] = [];
    if (visitorId) {
      votes = await storage.getVisitorVotes(visitorId);
    }
    
    res.json({ features: allFeatures, votes });
  });

  // Vote on a feature
  app.post("/api/features/:id/vote", async (req, res) => {
    try {
      const featureId = parseInt(req.params.id, 10);
      
      if (isNaN(featureId)) {
        return res.status(400).json({ message: "Invalid feature ID" });
      }
      
      const input = voteFeatureSchema.parse(req.body);
      
      const updated = await storage.voteOnFeature(featureId, input.visitorId, input.voteType);
      if (!updated) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error voting on feature:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Suggest a new feature
  app.post("/api/features", async (req, res) => {
    try {
      const input = suggestFeatureSchema.parse(req.body);
      
      // Get userId if authenticated
      const userId = req.user?.id || null;
      
      const feature = await storage.createFeature({
        title: input.title.trim(),
        description: input.description.trim(),
        isUserSuggested: true,
        suggestedByUserId: userId,
      });
      
      res.status(201).json(feature);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error suggesting feature:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}

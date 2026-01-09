import { db } from "./db";
import { 
  prompts, entries, users,
  type InsertEntry, type Prompt, type Entry, type User
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface ReminderSettings {
  enabled: boolean;
  time: string;
  timezone: string;
  email: string | null;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date | null;
  reminderEnabled: boolean | null;
}

export interface AdminStats {
  totalUsers: number;
  usersWithEmail: number;
  usersWithReminders: number;
  totalEntries: number;
}

export interface IStorage {
  // Prompts
  getRandomPrompt(category?: string): Promise<Prompt | undefined>;
  createPrompt(content: string, category: string): Promise<Prompt>;
  
  // Entries
  createEntry(entry: InsertEntry & { userId: string }): Promise<Entry>;
  getUserEntries(userId: string): Promise<(Entry & { prompt: Prompt | null })[]>;
  deleteEntry(id: number, userId: string): Promise<boolean>;
  getStreak(userId: string): Promise<{ currentStreak: number, longestStreak: number, lastEntryDate: string | null }>;
  
  // Reminders
  getReminderSettings(userId: string): Promise<ReminderSettings | undefined>;
  updateReminderSettings(userId: string, settings: Partial<ReminderSettings>): Promise<ReminderSettings | undefined>;
  
  // Admin
  getAdminStats(): Promise<AdminStats>;
  getAllUsers(): Promise<AdminUser[]>;
}

export class DatabaseStorage implements IStorage {

  // Prompts
  async getRandomPrompt(category?: string): Promise<Prompt | undefined> {
    let query = db.select().from(prompts);
    if (category) {
      // @ts-ignore - dynamic where clause
      query = query.where(eq(prompts.category, category));
    }
    const allPrompts = await query;
    if (allPrompts.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * allPrompts.length);
    return allPrompts[randomIndex];
  }

  async createPrompt(content: string, category: string): Promise<Prompt> {
    const [prompt] = await db.insert(prompts)
      .values({ content, category })
      .returning();
    return prompt;
  }

  // Entries
  async createEntry(entry: InsertEntry & { userId: string }): Promise<Entry> {
    const [newEntry] = await db.insert(entries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getUserEntries(userId: string): Promise<(Entry & { prompt: Prompt | null })[]> {
    return db.select({
      id: entries.id,
      userId: entries.userId,
      promptId: entries.promptId,
      content: entries.content,
      createdAt: entries.createdAt,
      wordCount: entries.wordCount,
      prompt: prompts
    })
    .from(entries)
    .leftJoin(prompts, eq(entries.promptId, prompts.id))
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.createdAt));
  }

  async deleteEntry(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getStreak(userId: string): Promise<{ currentStreak: number, longestStreak: number, lastEntryDate: string | null }> {
    const userEntries = await db.select({
      createdAt: entries.createdAt
    })
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.createdAt));

    if (userEntries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
    }

    // Get unique dates (one entry per day counts)
    const dateSet = new Set(
      userEntries.map(e => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    const uniqueDates = Array.from(dateSet).sort((a, b) => b - a); // Sort descending

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate current streak
    let currentStreak = 0;
    const todayTime = today.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Check if most recent entry was today or yesterday
    const mostRecentDiff = Math.floor((todayTime - uniqueDates[0]) / dayMs);
    
    if (mostRecentDiff <= 1) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const diff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / dayMs);
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak by scanning all dates
    let longestStreak = uniqueDates.length > 0 ? 1 : 0; // At least 1 if any entries exist
    let tempStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / dayMs);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Ensure longest streak is at least as big as current streak
    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      currentStreak,
      longestStreak,
      lastEntryDate: userEntries[0].createdAt.toISOString()
    };
  }

  // Reminders
  async getReminderSettings(userId: string): Promise<ReminderSettings | undefined> {
    const [user] = await db.select({
      enabled: users.reminderEnabled,
      time: users.reminderTime,
      timezone: users.reminderTimezone,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (!user) return undefined;
    
    return {
      enabled: user.enabled ?? false,
      time: user.time ?? "09:00",
      timezone: user.timezone ?? "America/New_York",
      email: user.email,
    };
  }

  async updateReminderSettings(userId: string, settings: Partial<ReminderSettings>): Promise<ReminderSettings | undefined> {
    const updateData: Record<string, any> = {};
    
    if (settings.enabled !== undefined) updateData.reminderEnabled = settings.enabled;
    if (settings.time !== undefined) updateData.reminderTime = settings.time;
    if (settings.timezone !== undefined) updateData.reminderTimezone = settings.timezone;
    if (settings.email !== undefined) updateData.email = settings.email;
    
    if (Object.keys(updateData).length === 0) {
      return this.getReminderSettings(userId);
    }
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
    
    return this.getReminderSettings(userId);
  }

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const allUsers = await db.select().from(users);
    const allEntries = await db.select().from(entries);
    
    return {
      totalUsers: allUsers.length,
      usersWithEmail: allUsers.filter(u => u.email).length,
      usersWithReminders: allUsers.filter(u => u.reminderEnabled).length,
      totalEntries: allEntries.length,
    };
  }

  async getAllUsers(): Promise<AdminUser[]> {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
      reminderEnabled: users.reminderEnabled,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
    
    return allUsers;
  }
}

export const storage = new DatabaseStorage();

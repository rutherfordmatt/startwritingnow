import { db } from "./db";
import { 
  prompts, entries, users,
  type InsertEntry, type Prompt, type Entry, type User
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Prompts
  getRandomPrompt(category?: string): Promise<Prompt | undefined>;
  createPrompt(content: string, category: string): Promise<Prompt>;
  
  // Entries
  createEntry(entry: InsertEntry): Promise<Entry>;
  getUserEntries(userId: string): Promise<(Entry & { prompt: Prompt | null })[]>;
  deleteEntry(id: number, userId: string): Promise<boolean>;
  getStreak(userId: string): Promise<{ currentStreak: number, longestStreak: number, lastEntryDate: string | null }>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }
  upsertUser(user: any): Promise<User> {
    return authStorage.upsertUser(user);
  }

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
  async createEntry(entry: InsertEntry): Promise<Entry> {
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
    const uniqueDates = [...new Set(
      userEntries.map(e => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )].sort((a, b) => b - a); // Sort descending

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
}

export const storage = new DatabaseStorage();

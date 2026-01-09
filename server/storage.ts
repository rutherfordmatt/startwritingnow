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

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if the most recent entry was today or yesterday
    const lastEntryDate = new Date(userEntries[0].createdAt);
    lastEntryDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      currentStreak = 1;
      let previousDate = lastEntryDate;

      for (let i = 1; i < userEntries.length; i++) {
        const entryDate = new Date(userEntries[i].createdAt);
        entryDate.setHours(0, 0, 0, 0);
        
        const dayDiff = (previousDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else if (dayDiff > 1) {
          break; 
        }
        previousDate = entryDate;
      }
    }
    
    // Simplified longest streak logic for MVP
    longestStreak = Math.max(currentStreak, longestStreak);

    return {
      currentStreak,
      longestStreak,
      lastEntryDate: userEntries[0].createdAt.toISOString()
    };
  }
}

export const storage = new DatabaseStorage();

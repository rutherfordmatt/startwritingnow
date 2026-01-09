import { pgTable, text, serial, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
export * from "./models/auth";

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").notNull(), // "Life" or "Career"
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  promptId: integer("prompt_id").references(() => prompts.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  wordCount: integer("word_count").notNull(),
});

export const insertEntrySchema = createInsertSchema(entries).omit({ 
  id: true, 
  createdAt: true,
  userId: true 
});

export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Prompt = typeof prompts.$inferSelect;

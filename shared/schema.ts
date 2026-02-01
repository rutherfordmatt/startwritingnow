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
  mood: varchar("mood", { length: 20 }), // Optional: happy, calm, grateful, neutral, anxious, sad, stressed
});

// Available moods for the UI
export const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'stressed', label: 'Stressed', emoji: '😤' },
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];

export const insertEntrySchema = createInsertSchema(entries).omit({ 
  id: true, 
  createdAt: true,
  userId: true 
});

export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Prompt = typeof prompts.$inferSelect;

// Feature voting system
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  isUserSuggested: boolean("is_user_suggested").default(false).notNull(),
  suggestedByUserId: text("suggested_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureVotes = pgTable("feature_votes", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").notNull().references(() => features.id),
  visitorId: text("visitor_id").notNull(),
  voteType: text("vote_type").notNull(), // "up" or "down"
});

// Zod schema for voting
export const voteFeatureSchema = z.object({
  visitorId: z.string().min(1).max(100),
  voteType: z.enum(['up', 'down']),
});

// Zod schema for suggesting features
export const suggestFeatureSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  createdAt: true,
  upvotes: true,
  downvotes: true,
});

export const insertFeatureVoteSchema = createInsertSchema(featureVotes).omit({
  id: true,
});

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type FeatureVote = typeof featureVotes.$inferSelect;
export type InsertFeatureVote = z.infer<typeof insertFeatureVoteSchema>;

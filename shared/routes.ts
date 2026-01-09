import { z } from 'zod';
import { insertEntrySchema, entries, prompts } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  prompts: {
    random: {
      method: 'GET' as const,
      path: '/api/prompts/random',
      input: z.object({
        category: z.enum(['Life', 'Career']).optional(),
      }).optional(),
      responses: {
        200: z.custom<typeof prompts.$inferSelect>(),
      },
    },
  },
  entries: {
    create: {
      method: 'POST' as const,
      path: '/api/entries',
      input: insertEntrySchema,
      responses: {
        201: z.custom<typeof entries.$inferSelect>(),
        400: errorSchemas.validation,
        401: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/entries',
      responses: {
        200: z.array(z.custom<typeof entries.$inferSelect & { prompt: typeof prompts.$inferSelect | null }>()),
        401: z.object({ message: z.string() }),
      },
    },
    streak: {
      method: 'GET' as const,
      path: '/api/streak',
      responses: {
        200: z.object({
          currentStreak: z.number(),
          longestStreak: z.number(),
          lastEntryDate: z.string().nullable(),
        }),
        401: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/entries/:id',
      responses: {
        204: z.void(),
        401: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type PromptResponse = z.infer<typeof api.prompts.random.responses[200]>;
export type EntryResponse = z.infer<typeof api.entries.create.responses[201]>;
export type EntriesListResponse = z.infer<typeof api.entries.list.responses[200]>;
export type StreakResponse = z.infer<typeof api.entries.streak.responses[200]>;
export type InsertEntry = z.infer<typeof insertEntrySchema>;

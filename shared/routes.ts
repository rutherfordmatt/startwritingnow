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

export const reminderSettingsSchema = z.object({
  enabled: z.boolean(),
  time: z.string(),
  timezone: z.string(),
  email: z.string().nullable(),
});

export const updateReminderSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  time: z.string().optional(),
  timezone: z.string().optional(),
  email: z.string().nullable().optional(),
});

export const adminStatsSchema = z.object({
  totalUsers: z.number(),
  usersWithEmail: z.number(),
  usersWithReminders: z.number(),
  totalEntries: z.number(),
});

export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  createdAt: z.string().nullable(),
  reminderEnabled: z.boolean().nullable(),
});

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
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: adminStatsSchema,
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
      },
    },
    users: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(adminUserSchema),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
      },
    },
  },
  reminders: {
    get: {
      method: 'GET' as const,
      path: '/api/reminders',
      responses: {
        200: reminderSettingsSchema,
        401: z.object({ message: z.string() }),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/reminders',
      input: updateReminderSettingsSchema,
      responses: {
        200: reminderSettingsSchema,
        401: z.object({ message: z.string() }),
      },
    },
    test: {
      method: 'POST' as const,
      path: '/api/reminders/test',
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        401: z.object({ message: z.string() }),
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
export type ReminderSettings = z.infer<typeof reminderSettingsSchema>;
export type UpdateReminderSettings = z.infer<typeof updateReminderSettingsSchema>;
export type AdminStats = z.infer<typeof adminStatsSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;

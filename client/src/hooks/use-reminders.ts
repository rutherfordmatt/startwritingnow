import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type ReminderSettings, type UpdateReminderSettings } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useReminderSettings() {
  return useQuery<ReminderSettings | null>({
    queryKey: [api.reminders.get.path],
    queryFn: async () => {
      const res = await fetch(api.reminders.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch reminder settings");
      return res.json();
    },
  });
}

export function useUpdateReminderSettings() {
  return useMutation({
    mutationFn: async (settings: UpdateReminderSettings) => {
      const res = await apiRequest("PATCH", api.reminders.update.path, settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reminders.get.path] });
    },
  });
}

export function useSendTestReminder() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", api.reminders.test.path);
      return res.json();
    },
  });
}

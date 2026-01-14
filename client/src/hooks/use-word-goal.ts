import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type WordGoalSettings, type UpdateWordGoal } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useWordGoalSettings() {
  return useQuery<WordGoalSettings | null>({
    queryKey: [api.wordGoal.get.path],
    queryFn: async () => {
      const res = await fetch(api.wordGoal.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch word goal settings");
      return res.json();
    },
  });
}

export function useUpdateWordGoal() {
  return useMutation({
    mutationFn: async (settings: UpdateWordGoal) => {
      const res = await apiRequest("PATCH", api.wordGoal.update.path, settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wordGoal.get.path] });
    },
  });
}

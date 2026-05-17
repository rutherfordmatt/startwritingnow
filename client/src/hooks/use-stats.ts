import { useQuery } from "@tanstack/react-query";
import type { UserStats } from "@shared/achievements";

export function useUserStats() {
  return useQuery<UserStats | null>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertEntry } from "@shared/routes";

export function useEntries() {
  return useQuery({
    queryKey: [api.entries.list.path],
    queryFn: async () => {
      const res = await fetch(api.entries.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch entries");
      return api.entries.list.responses[200].parse(await res.json());
    },
  });
}

export function useStreak() {
  return useQuery({
    queryKey: [api.entries.streak.path],
    queryFn: async () => {
      const res = await fetch(api.entries.streak.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch streak");
      return api.entries.streak.responses[200].parse(await res.json());
    },
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: InsertEntry) => {
      const res = await fetch(api.entries.create.path, {
        method: api.entries.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        credentials: "include",
      });
      
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.entries.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create entry");
      }
      return api.entries.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entries.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entries.streak.path] });
    },
  });
}

export function useRandomPrompt(category?: 'Life' | 'Career') {
  return useQuery({
    queryKey: [api.prompts.random.path, category],
    queryFn: async () => {
      const url = new URL(api.prompts.random.path, window.location.origin);
      if (category) {
        url.searchParams.set("category", category);
      }
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prompt");
      return api.prompts.random.responses[200].parse(await res.json());
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.entries.delete.path, { id });
      const res = await fetch(url, {
        method: api.entries.delete.method,
        credentials: "include",
      });
      
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      
      if (res.status === 404) {
        throw new Error("Entry not found");
      }
      
      if (!res.ok) {
        throw new Error("Failed to delete entry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entries.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entries.streak.path] });
    },
  });
}

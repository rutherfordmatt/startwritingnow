import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  reminderEnabled: boolean | null;
}

interface MagicLinkRequest {
  email: string;
  firstName?: string;
}

interface MagicLinkResponse {
  message: string;
}

interface EmailCheckResponse {
  exists: boolean;
}

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const checkEmailMutation = useMutation({
    mutationFn: async (email: string): Promise<EmailCheckResponse> => {
      const response = await apiRequest("POST", "/api/auth/magic-link/check", { email });
      return response.json();
    },
  });

  const requestMagicLinkMutation = useMutation({
    mutationFn: async (data: MagicLinkRequest): Promise<MagicLinkResponse> => {
      const response = await apiRequest("POST", "/api/auth/magic-link", data);
      return response.json();
    },
  });

  const verifyMagicLinkMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(`/api/auth/magic-link/verify?token=${token}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Verification failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    checkEmail: checkEmailMutation.mutateAsync,
    isCheckingEmail: checkEmailMutation.isPending,
    requestMagicLink: requestMagicLinkMutation.mutateAsync,
    magicLinkError: requestMagicLinkMutation.error,
    isRequestingMagicLink: requestMagicLinkMutation.isPending,
    verifyMagicLink: verifyMagicLinkMutation.mutateAsync,
    verifyError: verifyMagicLinkMutation.error,
    isVerifying: verifyMagicLinkMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

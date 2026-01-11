import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface VerificationStatus {
  isVerified: boolean;
}

export function useEmailVerificationStatus() {
  return useQuery<VerificationStatus>({
    queryKey: ["/api/auth/email/status"],
  });
}

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/email/send-verification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/email/status"] });
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("POST", "/api/auth/email/verify", { token });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/email/status"] });
    },
  });
}

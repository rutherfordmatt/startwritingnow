import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/use-email-verification";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const verifyEmail = useVerifyEmail();
  const calledRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    verifyEmail.mutate(token, {
      onSuccess: (data) => {
        setStatus("success");
        setMessage(data.message || "Your email has been verified!");
      },
      onError: (error: any) => {
        setStatus("error");
        setMessage(error.message || "Verification failed. The link may have expired.");
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
      >
        {status === "loading" && (
          <>
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="w-full"
              data-testid="button-go-to-dashboard"
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="outline"
              className="w-full"
              data-testid="button-go-to-dashboard-error"
            >
              Go to Dashboard
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MagicLinkVerify() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const { verifyMagicLink, isVerifying } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found. Please request a new sign-in link.");
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    verifyMagicLink(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1500);
      })
      .catch((err: any) => {
        setStatus("error");
        setErrorMessage(err?.message || "Verification failed. Please request a new sign-in link.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <img src={logoBlack} alt="startwriting.now" className="h-8 dark:hidden" />
          <img src={logoWhite} alt="startwriting.now" className="h-8 hidden dark:block" />
        </div>
        <ThemeToggle />
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50">
            <CardHeader className="text-center">
              {status === "verifying" && (
                <>
                  <div className="mx-auto mb-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-serif" data-testid="text-verify-title">
                    Signing you in...
                  </CardTitle>
                  <CardDescription data-testid="text-verify-description">
                    Please wait while we verify your link
                  </CardDescription>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-serif" data-testid="text-verify-success">
                    You're in!
                  </CardTitle>
                  <CardDescription>
                    Redirecting you to your dashboard...
                  </CardDescription>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl font-serif" data-testid="text-verify-error">
                    Link expired or invalid
                  </CardTitle>
                  <CardDescription data-testid="text-verify-error-message">
                    {errorMessage}
                  </CardDescription>
                </>
              )}
            </CardHeader>

            {status === "error" && (
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => setLocation("/auth")}
                  data-testid="button-back-to-login"
                >
                  Request a new link
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

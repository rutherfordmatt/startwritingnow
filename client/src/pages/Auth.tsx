import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";

type AuthStep = "email" | "name" | "sent";

export default function Auth() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  
  const { user, checkEmail, isCheckingEmail, requestMagicLink, isRequestingMagicLink } = useAuth();

  const isLoading = isCheckingEmail || isRequestingMagicLink;

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const { exists } = await checkEmail(email);
      if (exists) {
        await requestMagicLink({ email });
        setStep("sent");
      } else {
        setStep("name");
      }
    } catch (err: any) {
      const message = err?.message || "Something went wrong";
      try {
        const parsed = JSON.parse(message.replace(/^\d+:\s*/, ""));
        setError(parsed.message || message);
      } catch {
        setError(message);
      }
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      await requestMagicLink({ email, firstName: firstName.trim() });
      setStep("sent");
    } catch (err: any) {
      const message = err?.message || "Something went wrong";
      try {
        const parsed = JSON.parse(message.replace(/^\d+:\s*/, ""));
        setError(parsed.message || message);
      } catch {
        setError(message);
      }
    }
  };

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
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {step === "email" && (
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif">
                  Welcome to startwriting.now
                </CardTitle>
                <CardDescription>
                  Enter your email to sign in or create an account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                      data-testid="input-email"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center" data-testid="text-auth-error">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-auth-submit"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "name" && (
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif">
                  Welcome! Let's get started
                </CardTitle>
                <CardDescription>
                  What should we call you?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Your first name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isRequestingMagicLink}
                      autoFocus
                      data-testid="input-first-name"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center" data-testid="text-auth-error">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isRequestingMagicLink}
                    data-testid="button-auth-name-submit"
                  >
                    {isRequestingMagicLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send sign-in link
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setError("");
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      data-testid="button-back-to-email"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "sent" && (
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-serif">
                  Check your email
                </CardTitle>
                <CardDescription>
                  We sent a sign-in link to <strong className="text-foreground">{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Click the link in the email to sign in. The link expires in 15 minutes.
                </p>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setEmail("");
                      setFirstName("");
                      setError("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    data-testid="button-try-different-email"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Try a different email
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}

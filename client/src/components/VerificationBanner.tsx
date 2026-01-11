import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSendVerificationEmail } from "@/hooks/use-email-verification";
import { useToast } from "@/hooks/use-toast";

interface VerificationBannerProps {
  email: string | null;
}

export function VerificationBanner({ email }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();
  const sendVerification = useSendVerificationEmail();

  const handleSendVerification = async () => {
    try {
      const result = await sendVerification.mutateAsync();
      toast({
        title: "Verification email sent",
        description: result.message || "Check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Verify your email
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {email ? (
                <>Please verify <strong>{email}</strong> to enable daily reminders and get the full experience.</>
              ) : (
                <>Add and verify your email to enable daily reminders.</>
              )}
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                onClick={handleSendVerification}
                disabled={sendVerification.isPending || !email}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="button-send-verification"
              >
                {sendVerification.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Send verification email</>
                )}
              </Button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            data-testid="button-dismiss-banner"
          >
            <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

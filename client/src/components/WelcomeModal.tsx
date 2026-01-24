import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Timer, PenLine, Flame, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const STORAGE_KEY_PREFIX = "snw_welcome_shown_";

export function useWelcomeModal(isAuthenticated: boolean, userId?: string) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
      const hasSeenWelcome = localStorage.getItem(storageKey);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated, userId]);

  const dismissWelcome = (userId?: string) => {
    if (userId) {
      const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
      localStorage.setItem(storageKey, "true");
    }
    setShowWelcome(false);
  };

  return { showWelcome, dismissWelcome };
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Timer,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
      title: `Welcome${userName ? `, ${userName}` : ""}!`,
      description: "This is your space for 3-minute micro-journaling. No pressure, no judgment - just you and your thoughts.",
    },
    {
      icon: PenLine,
      iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30",
      title: "How it works",
      description: "Pick a prompt that speaks to you, then start typing. The 3-minute timer begins when you type your first word. Just write freely - don't worry about perfection.",
    },
    {
      icon: Flame,
      iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
      title: "Build your streak",
      description: "Write daily to build your streak. Even one entry counts! We'll help you stay on track with optional reminders.",
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-welcome">
        <DialogHeader className="text-center sm:text-center">
          <motion.div 
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4"
          >
            <div className={`inline-flex p-4 rounded-full ${currentStep.iconBg}`}>
              <currentStep.icon className="w-8 h-8" />
            </div>
          </motion.div>
          <motion.div
            key={`title-${step}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <DialogTitle className="text-xl font-serif">{currentStep.title}</DialogTitle>
          </motion.div>
          <motion.div
            key={`desc-${step}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DialogDescription className="text-base pt-2">
              {currentStep.description}
            </DialogDescription>
          </motion.div>
        </DialogHeader>
        
        <div className="flex justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              data-testid="button-welcome-back"
            >
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="gap-2" data-testid="button-welcome-next">
            {isLastStep ? "Start Writing" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

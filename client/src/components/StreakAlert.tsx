import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreakAlertProps {
  currentStreak: number;
  longestStreak: number;
  hasWrittenToday: boolean;
  userId?: string;
  onDismiss: () => void;
}

const DISMISSED_KEY_PREFIX = "snw_streak_alert_dismissed_";
const MILESTONE_KEY_PREFIX = "snw_last_milestone_";

export function useStreakAlert(currentStreak: number, hasWrittenToday: boolean, userId?: string) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"at-risk" | "milestone" | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const dismissedKey = `${DISMISSED_KEY_PREFIX}${userId}`;
    const milestoneKey = `${MILESTONE_KEY_PREFIX}${userId}`;
    
    const dismissedToday = localStorage.getItem(dismissedKey);
    const today = new Date().toDateString();
    
    if (dismissedToday === today) {
      return;
    }

    const milestones = [7, 14, 21, 30, 50, 100, 365];
    const lastMilestone = parseInt(localStorage.getItem(milestoneKey) || "0");
    
    const newMilestone = milestones.find(m => currentStreak >= m && m > lastMilestone);
    if (newMilestone && hasWrittenToday) {
      setAlertType("milestone");
      setShowAlert(true);
      localStorage.setItem(milestoneKey, String(newMilestone));
      return;
    }

    if (currentStreak > 0 && !hasWrittenToday) {
      setAlertType("at-risk");
      setShowAlert(true);
    }
  }, [currentStreak, hasWrittenToday, userId]);

  const dismissAlert = (userId?: string) => {
    if (userId) {
      const dismissedKey = `${DISMISSED_KEY_PREFIX}${userId}`;
      localStorage.setItem(dismissedKey, new Date().toDateString());
    }
    setShowAlert(false);
  };

  return { showAlert, alertType, dismissAlert };
}

export function StreakAlert({ currentStreak, longestStreak, hasWrittenToday, userId, onDismiss }: StreakAlertProps) {
  const { showAlert, alertType, dismissAlert } = useStreakAlert(currentStreak, hasWrittenToday, userId);

  const handleDismiss = () => {
    dismissAlert(userId);
    onDismiss();
  };

  if (!showAlert || !alertType) return null;

  const isAtRisk = alertType === "at-risk";
  const isMilestone = alertType === "milestone";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`relative rounded-xl p-4 mb-6 border ${
          isAtRisk 
            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50" 
            : "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/50"
        }`}
        data-testid="alert-streak"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100"
          onClick={handleDismiss}
          data-testid="button-dismiss-streak-alert"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex items-start gap-3 pr-6">
          <div className={`p-2 rounded-full ${
            isAtRisk 
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/50" 
              : "bg-purple-100 text-purple-600 dark:bg-purple-900/50"
          }`}>
            {isAtRisk ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Trophy className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            {isAtRisk ? (
              <>
                <h4 className="font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  You're on a {currentStreak}-day streak!
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  One quick entry keeps it going. Just 3 minutes to maintain your momentum.
                </p>
              </>
            ) : (
              <>
                <h4 className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Milestone reached!
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Amazing! You've written for {currentStreak} days in a row. 
                  {currentStreak >= longestStreak && " That's your best streak ever!"}
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

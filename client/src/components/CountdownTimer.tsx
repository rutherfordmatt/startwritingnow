import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, CheckCircle2 } from "lucide-react";

interface CountdownTimerProps {
  durationSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
}

export function CountdownTimer({ durationSeconds, isRunning, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const progress = ((durationSeconds - timeLeft) / durationSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isComplete = timeLeft === 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (progress / 100) * 125.6}
            className={`transition-all duration-1000 ease-linear ${
              isComplete ? "text-green-500" : "text-primary"
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </motion.div>
          ) : (
            <Timer className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className={`font-mono text-xl font-medium tabular-nums ${
          isComplete ? "text-green-600" : "text-foreground"
        }`}>
          {formattedTime}
        </span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {isComplete ? "Complete" : "Remaining"}
        </span>
      </div>
    </div>
  );
}

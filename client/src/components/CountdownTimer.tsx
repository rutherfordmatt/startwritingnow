import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Timer, CheckCircle2 } from "lucide-react";

interface CountdownTimerProps {
  durationSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
}

export function CountdownTimer({ durationSeconds, isRunning, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [bonusTime, setBonusTime] = useState(0);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const prevIsRunningRef = useRef(isRunning);
  
  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Reset state when durationSeconds changes
  useEffect(() => {
    setTimeLeft(durationSeconds);
    setBonusTime(0);
    hasCompletedRef.current = false;
  }, [durationSeconds]);
  
  // Reset state when isRunning transitions from false to true (new session start)
  useEffect(() => {
    if (isRunning && !prevIsRunningRef.current) {
      // New session starting
      setTimeLeft(durationSeconds);
      setBonusTime(0);
      hasCompletedRef.current = false;
    }
    prevIsRunningRef.current = isRunning;
  }, [isRunning, durationSeconds]);

  // Single interval effect - only keyed by isRunning
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          // Still counting down
          if (prevTime === 1 && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current();
          }
          return prevTime - 1;
        }
        return 0;
      });
      
      // Use functional update for bonus time too
      setBonusTime((prevBonus) => {
        // Only start incrementing bonus after timeLeft has reached 0
        // We check hasCompletedRef because it's set when timeLeft hits 1
        return hasCompletedRef.current ? prevBonus + 1 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]); // Only depend on isRunning to avoid interval churn

  const progress = Math.min(100, ((durationSeconds - timeLeft) / durationSeconds) * 100);
  const isComplete = timeLeft === 0;
  
  // Format time display
  let formattedTime: string;
  let timeLabel: string;
  
  if (isComplete && bonusTime > 0) {
    const bonusMinutes = Math.floor(bonusTime / 60);
    const bonusSeconds = bonusTime % 60;
    formattedTime = `+${bonusMinutes}:${bonusSeconds.toString().padStart(2, '0')}`;
    timeLabel = "Bonus time";
  } else {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timeLabel = isComplete ? "Complete" : "Remaining";
  }

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
          {timeLabel}
        </span>
      </div>
    </div>
  );
}

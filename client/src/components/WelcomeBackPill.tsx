import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface WelcomeBackPillProps {
  userName?: string;
  currentStreak: number;
  totalEntries: number;
  lastEntryDate?: Date | null;
  hasWrittenToday: boolean;
}

export function WelcomeBackPill({ 
  userName, 
  currentStreak, 
  totalEntries,
  lastEntryDate,
  hasWrittenToday 
}: WelcomeBackPillProps) {
  if (totalEntries === 0) return null;
  
  const getMessage = () => {
    const name = userName ? `, ${userName}` : "";
    
    if (hasWrittenToday) {
      return `Great work today${name}! You've written ${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'} total.`;
    }
    
    if (currentStreak > 0) {
      return `Welcome back${name}! Keep your ${currentStreak}-day streak alive.`;
    }
    
    if (lastEntryDate) {
      const lastWritten = formatDistanceToNow(new Date(lastEntryDate), { addSuffix: true });
      return `Welcome back${name}! You last wrote ${lastWritten}.`;
    }
    
    return `Welcome back${name}! Ready to write?`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex justify-center mb-4"
    >
      <div 
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/30 text-sm text-muted-foreground"
        data-testid="pill-welcome-back"
      >
        {currentStreak > 0 ? (
          <Flame className="w-3.5 h-3.5 text-orange-500" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-primary/60" />
        )}
        <span>{getMessage()}</span>
      </div>
    </motion.div>
  );
}

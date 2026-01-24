import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WelcomeBackPillProps {
  userName?: string;
  currentStreak: number;
  totalEntries: number;
  monthlyWordCount: number;
  lastEntryDate?: Date | null;
  hasWrittenToday: boolean;
}

export function WelcomeBackPill({ 
  userName, 
  currentStreak, 
  totalEntries,
  monthlyWordCount,
  lastEntryDate,
  hasWrittenToday 
}: WelcomeBackPillProps) {
  if (totalEntries === 0) return null;
  
  const name = userName || "there";
  
  const getMainMessage = () => {
    if (currentStreak > 0) {
      return `Welcome back, ${name}! You're on a ${currentStreak}-day streak.`;
    }
    return `Welcome back, ${name}!`;
  };
  
  const getSecondaryMessage = () => {
    const parts: string[] = [];
    
    if (monthlyWordCount > 0) {
      const formattedCount = monthlyWordCount.toLocaleString();
      parts.push(`${formattedCount} words this month`);
    }
    
    if (lastEntryDate && !hasWrittenToday) {
      const lastWritten = formatDistanceToNow(new Date(lastEntryDate), { addSuffix: true });
      parts.push(`last entry ${lastWritten}`);
    } else if (hasWrittenToday) {
      parts.push(`${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'} total`);
    }
    
    return parts.join(" · ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex justify-center mb-4"
    >
      <div 
        className="inline-flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl bg-muted/50 border border-border/30 text-center"
        data-testid="pill-welcome-back"
      >
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          {currentStreak > 0 ? (
            <Flame className="w-3.5 h-3.5 text-orange-500" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-primary/60" />
          )}
          <span>{getMainMessage()}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {getSecondaryMessage()}
        </div>
      </div>
    </motion.div>
  );
}

import { useMemo } from "react";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Entry {
  id: number;
  createdAt: Date | string;
  wordCount: number;
}

interface WritingCalendarProps {
  entries: Entry[];
  daysToShow?: number;
}

export function WritingCalendar({ entries, daysToShow = 90 }: WritingCalendarProps) {
  const today = startOfDay(new Date());
  
  const { days, entriesMap } = useMemo(() => {
    const map = new Map<string, { count: number; words: number }>();
    
    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.createdAt), "yyyy-MM-dd");
      const existing = map.get(dateKey) || { count: 0, words: 0 };
      map.set(dateKey, {
        count: existing.count + 1,
        words: existing.words + entry.wordCount,
      });
    });

    const startDate = subDays(today, daysToShow - 1);
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    
    return { 
      days: allDays.map(date => ({
        date,
        dateKey: format(date, "yyyy-MM-dd"),
      })),
      entriesMap: map 
    };
  }, [entries, daysToShow, today]);

  const getIntensity = (dateKey: string): number => {
    const data = entriesMap.get(dateKey);
    if (!data) return 0;
    if (data.count >= 3) return 4;
    if (data.count >= 2) return 3;
    if (data.words >= 200) return 2;
    return 1;
  };

  const intensityClasses: Record<number, string> = {
    0: "bg-muted/40 dark:bg-muted/20",
    1: "bg-primary/25 dark:bg-primary/30",
    2: "bg-primary/45 dark:bg-primary/50",
    3: "bg-primary/70 dark:bg-primary/75",
    4: "bg-primary dark:bg-primary",
  };

  const totalEntries = entries.length;
  const activeDays = Array.from(entriesMap.keys()).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground text-sm">Activity</h3>
        <p className="text-xs text-muted-foreground">
          {activeDays} active days · {totalEntries} entries
        </p>
      </div>

      <div className="flex gap-[3px] flex-wrap" data-testid="calendar-grid">
        {days.map((day) => {
          const intensity = getIntensity(day.dateKey);
          const isToday = day.dateKey === format(today, "yyyy-MM-dd");
          const data = entriesMap.get(day.dateKey);
          
          return (
            <Tooltip key={day.dateKey}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    w-[10px] h-[10px] rounded-[2px] transition-all duration-200
                    ${intensityClasses[intensity]}
                    ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""}
                  `}
                  data-testid={`calendar-day-${day.dateKey}`}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{format(day.date, "MMM d, yyyy")}</p>
                {data ? (
                  <p className="text-muted-foreground">
                    {data.count} {data.count === 1 ? "entry" : "entries"} · {data.words} words
                  </p>
                ) : (
                  <p className="text-muted-foreground">No entries</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-[2px]">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-[10px] h-[10px] rounded-[2px] ${intensityClasses[level]}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}

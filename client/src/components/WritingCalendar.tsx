import { useMemo } from "react";
import { format, startOfDay, eachDayOfInterval, getDay, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
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

export function WritingCalendar({ entries, daysToShow = 30 }: WritingCalendarProps) {
  const today = startOfDay(new Date());
  
  const { weeks, entriesMap } = useMemo(() => {
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
    const weekStart = startOfWeek(startDate);
    const weekEnd = endOfWeek(today);
    
    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weekRows: { date: Date; dateKey: string; inRange: boolean }[][] = [];
    let currentWeek: { date: Date; dateKey: string; inRange: boolean }[] = [];
    
    allDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const inRange = day >= startDate && day <= today;
      
      currentWeek.push({ date: day, dateKey, inRange });
      
      if (getDay(day) === 6) {
        weekRows.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weekRows.push(currentWeek);
    }
    
    return { weeks: weekRows, entriesMap: map };
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
    0: "bg-muted/30 dark:bg-muted/20",
    1: "bg-primary/20 dark:bg-primary/30",
    2: "bg-primary/40 dark:bg-primary/50",
    3: "bg-primary/60 dark:bg-primary/70",
    4: "bg-primary dark:bg-primary",
  };

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Writing Activity</h3>
        <p className="text-xs text-muted-foreground">
          Last {daysToShow} days
        </p>
      </div>

      <div className="space-y-1" data-testid="calendar-grid">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((label, idx) => (
            <div key={idx} className="text-center text-xs text-muted-foreground font-medium">
              {label}
            </div>
          ))}
        </div>
        
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const intensity = day.inRange ? getIntensity(day.dateKey) : -1;
              const isToday = day.dateKey === format(today, "yyyy-MM-dd");
              const data = entriesMap.get(day.dateKey);
              
              return (
                <Tooltip key={day.dateKey || `empty-${weekIndex}-${getDay(day.date)}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        aspect-square rounded-md transition-all duration-200 flex items-center justify-center
                        ${!day.inRange ? "bg-transparent" : intensityClasses[intensity]}
                        ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
                      `}
                      data-testid={`calendar-day-${day.dateKey}`}
                    >
                      <span className={`text-xs ${day.inRange ? (intensity >= 3 ? "text-primary-foreground" : "text-muted-foreground") : "text-transparent"}`}>
                        {format(day.date, "d")}
                      </span>
                    </div>
                  </TooltipTrigger>
                  {day.inRange && (
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
                  )}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${intensityClasses[level]}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}

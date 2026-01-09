import { useMemo } from "react";
import { format, startOfDay, eachDayOfInterval, getDay, addDays, subDays } from "date-fns";
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
  
  const { calendarData } = useMemo(() => {
    const entriesMap = new Map<string, { count: number; words: number }>();
    
    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.createdAt), "yyyy-MM-dd");
      const existing = entriesMap.get(dateKey) || { count: 0, words: 0 };
      entriesMap.set(dateKey, {
        count: existing.count + 1,
        words: existing.words + entry.wordCount,
      });
    });

    const startDate = subDays(today, daysToShow - 1);
    
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    
    const weeks: { date: Date; dateKey: string; data: { count: number; words: number } | null }[][] = [];
    let currentWeek: { date: Date; dateKey: string; data: { count: number; words: number } | null }[] = [];
    
    const firstDayOfWeek = getDay(startDate);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: subDays(startDate, firstDayOfWeek - i), dateKey: "", data: null });
    }
    
    allDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const data = entriesMap.get(dateKey) || null;
      
      currentWeek.push({ date: day, dateKey, data });
      
      if (getDay(day) === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDay = currentWeek[currentWeek.length - 1].date;
        currentWeek.push({ date: addDays(lastDay, 1), dateKey: "", data: null });
      }
      weeks.push(currentWeek);
    }
    
    return { calendarData: weeks };
  }, [entries, daysToShow, today]);

  const getIntensity = (data: { count: number; words: number } | null): number => {
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

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

      <div className="flex gap-2">
        <div className="flex flex-col justify-between text-xs text-muted-foreground pr-2 py-1">
          {[0, 2, 4, 6].map((dayIndex) => (
            <span key={dayIndex} className="h-3 leading-3">
              {dayIndex % 2 === 0 ? dayLabels[dayIndex].charAt(0) : ""}
            </span>
          ))}
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1" data-testid="calendar-grid">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => {
                  const intensity = getIntensity(day.data);
                  const isToday = day.dateKey === format(today, "yyyy-MM-dd");
                  const isFuture = day.date > today;
                  
                  return (
                    <Tooltip key={day.dateKey}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            w-3 h-3 rounded-sm transition-all duration-200
                            ${isFuture ? "bg-transparent" : intensityClasses[intensity]}
                            ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""}
                          `}
                          data-testid={`calendar-day-${day.dateKey}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{format(day.date, "MMM d, yyyy")}</p>
                        {day.data ? (
                          <p className="text-muted-foreground">
                            {day.data.count} {day.data.count === 1 ? "entry" : "entries"} · {day.data.words} words
                          </p>
                        ) : (
                          <p className="text-muted-foreground">No entries</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
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

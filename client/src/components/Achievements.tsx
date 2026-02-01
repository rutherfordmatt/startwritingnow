import { useState } from "react";
import { useUserStats } from "@/hooks/use-stats";
import { ACHIEVEMENTS, getUnlockedAchievements, getProgress } from "@shared/achievements";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pencil, Layers, Book, Library, Trophy, Flame, Calendar,
  Star, Crown, Type, PenTool, Feather, Compass, Heart, Sun, Lock, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, typeof Pencil> = {
  'pencil': Pencil,
  'layers': Layers,
  'book': Book,
  'library': Library,
  'trophy': Trophy,
  'flame': Flame,
  'calendar': Calendar,
  'star': Star,
  'crown': Crown,
  'type': Type,
  'pen-tool': PenTool,
  'feather': Feather,
  'compass': Compass,
  'heart': Heart,
  'sun': Sun,
};

const categoryLabels: Record<string, string> = {
  'entries': 'Entry Milestones',
  'streak': 'Streak Badges',
  'words': 'Word Count',
  'category': 'Category Explorer',
};

const categoryOrder = ['entries', 'streak', 'words', 'category'];

export function Achievements() {
  const { data: stats, isLoading } = useUserStats();
  const [showAll, setShowAll] = useState(false);

  if (isLoading || !stats) {
    return null;
  }

  const unlocked = getUnlockedAchievements(stats);
  const unlockedIds = new Set(unlocked.map(a => a.id));
  
  const nextToUnlock = ACHIEVEMENTS
    .filter(a => !unlockedIds.has(a.id))
    .map(a => ({ ...a, progress: getProgress(a, stats) }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const achievementsByCategory = categoryOrder.map(cat => ({
    category: cat,
    label: categoryLabels[cat],
    achievements: ACHIEVEMENTS.filter(a => a.category === cat).map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      progress: getProgress(a, stats),
    })),
  }));

  return (
    <>
      <div className="space-y-5" data-testid="achievements-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Achievements</h2>
              <p className="text-xs text-muted-foreground">{unlocked.length} of {ACHIEVEMENTS.length} unlocked</p>
            </div>
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
            data-testid="button-show-all-achievements"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {unlocked.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {unlocked.slice(0, 5).map((achievement, index) => {
              const Icon = iconMap[achievement.icon] || Trophy;
              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0"
                    >
                      <div 
                        className="group relative w-20 text-center cursor-default"
                        data-testid={`achievement-${achievement.id}`}
                      >
                        <div className="mx-auto mb-2">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400/20 via-emerald-400/15 to-green-500/10 border border-green-500/30 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                            <Icon className="w-7 h-7 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <h3 className="text-[11px] font-medium leading-tight text-foreground/80">{achievement.title}</h3>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-48 text-center">
                    <p className="font-medium text-primary">{achievement.title}</p>
                    <p className="text-muted-foreground">{achievement.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {unlocked.length > 5 && (
              <button
                onClick={() => setShowAll(true)}
                className="flex-shrink-0 w-20 flex flex-col items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors">
                  <span className="text-lg font-semibold">+{unlocked.length - 5}</span>
                </div>
                <span className="text-[11px] mt-2">more</span>
              </button>
            )}
          </div>
        ) : (
          <div className="py-6 text-center rounded-xl bg-muted/30 border border-dashed border-border">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-muted flex items-center justify-center">
              <Trophy className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Start writing to unlock your first achievement!
            </p>
          </div>
        )}

        {nextToUnlock.length > 0 && unlocked.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Up next</p>
            <div className="space-y-2">
              {nextToUnlock.slice(0, 2).map((achievement) => {
                const Icon = iconMap[achievement.icon] || Trophy;
                const progressPercent = Math.round(achievement.progress * 100);
                return (
                  <div 
                    key={achievement.id} 
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{achievement.title}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl">All Achievements</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {unlocked.length} of {ACHIEVEMENTS.length} unlocked
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 mt-6">
            {achievementsByCategory.map(({ category, label, achievements }) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">{label}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => {
                    const Icon = iconMap[achievement.icon] || Trophy;
                    const progressPercent = Math.round(achievement.progress * 100);
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {achievement.unlocked ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="group p-4 rounded-2xl bg-gradient-to-br from-green-400/10 via-emerald-400/5 to-transparent border border-green-500/20 text-center cursor-default hover:shadow-md transition-all">
                                <div className="mx-auto mb-3 w-fit">
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400/25 via-emerald-400/20 to-green-500/15 flex items-center justify-center">
                                    <Icon className="w-7 h-7 text-green-600 dark:text-green-400" />
                                  </div>
                                </div>
                                <h4 className="text-sm font-medium mb-1">{achievement.title}</h4>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {achievement.description}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="text-green-500 font-medium">Unlocked!</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center opacity-60 hover:opacity-80 transition-opacity">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted flex items-center justify-center">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <h4 className="text-sm font-medium mb-1">{achievement.title}</h4>
                            <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                              {achievement.description}
                            </p>
                            <div className="space-y-1">
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50 rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {progressPercent}% complete
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

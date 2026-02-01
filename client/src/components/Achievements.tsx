import { useState } from "react";
import { useUserStats } from "@/hooks/use-stats";
import { ACHIEVEMENTS, getUnlockedAchievements, getProgress } from "@shared/achievements";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-4" data-testid="achievements-section">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Achievements</h2>
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
            data-testid="button-show-all-achievements"
          >
            Show all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {unlocked.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {unlocked.slice(0, 6).map((achievement) => {
              const Icon = iconMap[achievement.icon] || Trophy;
              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex-shrink-0"
                    >
                      <Card className="p-3 text-center hover-elevate cursor-default w-24" data-testid={`achievement-${achievement.id}`}>
                        <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-medium truncate">{achievement.title}</h3>
                      </Card>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-48 text-center">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-muted-foreground">{achievement.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {unlocked.length > 6 && (
              <button
                onClick={() => setShowAll(true)}
                className="flex-shrink-0 w-24 rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                +{unlocked.length - 6} more
              </button>
            )}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Start writing to unlock achievements!
            </p>
          </Card>
        )}

        {nextToUnlock.length > 0 && unlocked.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Next up</p>
            <div className="flex gap-2">
              {nextToUnlock.slice(0, 2).map((achievement) => (
                <Card key={achievement.id} className="p-2 flex-1 opacity-70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{achievement.title}</p>
                      <Progress value={achievement.progress * 100} className="h-1 mt-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              All Achievements
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {unlocked.length} / {ACHIEVEMENTS.length} unlocked
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {achievementsByCategory.map(({ category, label, achievements }) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{label}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {achievements.map((achievement) => {
                    const Icon = iconMap[achievement.icon] || Trophy;
                    const cardContent = (
                      <Card className={`p-3 text-center h-full ${achievement.unlocked ? "bg-primary/5 border-primary/20" : ""}`}>
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? "bg-primary/15" : "bg-muted"
                        }`}>
                          {achievement.unlocked ? (
                            <Icon className="w-6 h-6 text-primary" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <h4 className="text-xs font-medium mb-0.5">{achievement.title}</h4>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <Progress value={achievement.progress * 100} className="h-1" />
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {Math.round(achievement.progress * 100)}%
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={achievement.unlocked ? "" : "opacity-50"}
                      >
                        {achievement.unlocked ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-default">{cardContent}</div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="text-primary font-medium">Unlocked!</p>
                              <p className="text-muted-foreground">{achievement.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          cardContent
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

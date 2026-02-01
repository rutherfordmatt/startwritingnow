import { useUserStats } from "@/hooks/use-stats";
import { ACHIEVEMENTS, getUnlockedAchievements, getProgress, type UserStats } from "@shared/achievements";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Pencil, Layers, Book, Library, Trophy, Flame, Calendar,
  Star, Crown, Type, PenTool, Feather, Compass, Heart, Sun, Lock
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

export function Achievements() {
  const { data: stats, isLoading } = useUserStats();

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

  return (
    <div className="space-y-6" data-testid="achievements-section">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Achievements</h2>
        <span className="text-sm text-muted-foreground">
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {unlocked.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {unlocked.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            return (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <Card className="p-3 text-center hover-elevate cursor-default" data-testid={`achievement-${achievement.id}`}>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xs font-medium truncate">{achievement.title}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                    {achievement.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {nextToUnlock.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Next achievements</h3>
          <div className="space-y-2">
            {nextToUnlock.map((achievement) => {
              const Icon = iconMap[achievement.icon] || Trophy;
              return (
                <Card 
                  key={achievement.id} 
                  className="p-3 opacity-60"
                  data-testid={`achievement-locked-${achievement.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium truncate">{achievement.title}</h4>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {Math.round(achievement.progress * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      <Progress value={achievement.progress * 100} className="h-1 mt-1.5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {unlocked.length === 0 && (
        <Card className="p-6 text-center">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Start writing to unlock achievements!
          </p>
        </Card>
      )}
    </div>
  );
}

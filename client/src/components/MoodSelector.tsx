import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MoodValue } from "@shared/schema";
import { Smile, CloudSun, Heart, Minus, AlertCircle, CloudRain, Zap, X } from "lucide-react";

interface MoodSelectorProps {
  isOpen: boolean;
  onSelect: (mood: MoodValue) => void;
  onSkip: () => void;
}

const MOOD_ICONS = [
  { value: 'happy' as MoodValue, label: 'Happy', icon: Smile, color: 'text-amber-500' },
  { value: 'calm' as MoodValue, label: 'Calm', icon: CloudSun, color: 'text-sky-500' },
  { value: 'grateful' as MoodValue, label: 'Grateful', icon: Heart, color: 'text-rose-500' },
  { value: 'neutral' as MoodValue, label: 'Neutral', icon: Minus, color: 'text-slate-500' },
  { value: 'anxious' as MoodValue, label: 'Anxious', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'sad' as MoodValue, label: 'Sad', icon: CloudRain, color: 'text-blue-500' },
  { value: 'stressed' as MoodValue, label: 'Stressed', icon: Zap, color: 'text-purple-500' },
];

export function MoodSelector({ isOpen, onSelect, onSkip }: MoodSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onSkip}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-3xl shadow-lg"
            data-testid="mood-selector-overlay"
          >
            <div className="max-w-lg mx-auto p-6 pb-8">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              
              <h2 className="text-xl font-serif font-medium text-center mb-2">
                How are you feeling?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Track your mood to discover patterns
              </p>
              
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 mb-6">
                {MOOD_ICONS.map((mood, index) => {
                  const Icon = mood.icon;
                  return (
                    <motion.button
                      key={mood.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => onSelect(mood.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover-elevate transition-all"
                      data-testid={`mood-${mood.value}`}
                    >
                      <Icon className={`w-6 h-6 ${mood.color}`} />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{mood.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-muted-foreground"
                  data-testid="button-mood-skip"
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

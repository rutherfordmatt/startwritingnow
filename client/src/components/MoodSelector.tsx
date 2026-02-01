import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOOD_OPTIONS, type MoodValue } from "@shared/schema";
import { X } from "lucide-react";

interface MoodSelectorProps {
  isOpen: boolean;
  onSelect: (mood: MoodValue) => void;
  onSkip: () => void;
}

export function MoodSelector({ isOpen, onSelect, onSkip }: MoodSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          data-testid="mood-selector-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center p-8 max-w-md w-full mx-4"
          >
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-serif font-medium mb-2"
            >
              How are you feeling?
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-muted-foreground mb-8"
            >
              Track your mood to discover patterns in your writing
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-8"
            >
              {MOOD_OPTIONS.map((mood, index) => (
                <motion.button
                  key={mood.value}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  onClick={() => onSelect(mood.value)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover-elevate transition-all"
                  data-testid={`mood-option-${mood.value}`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-muted-foreground">{mood.label}</span>
                </motion.button>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-muted-foreground"
                data-testid="button-skip-mood"
              >
                <X className="w-4 h-4 mr-2" />
                Skip
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRandomPrompt, useCreateEntry, usePromptById, useStreak, useEntries, useUpdateEntryMood } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { useWordGoalSettings, useTodayWordCount } from "@/hooks/use-word-goal";
import { PromptCard, type PromptCategory } from "@/components/PromptCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WelcomeModal, useWelcomeModal } from "@/components/WelcomeModal";
import { StreakAlert, useStreakAlert } from "@/components/StreakAlert";
import { ReminderSetupModal } from "@/components/ReminderSetupModal";
import { WelcomeBackPill } from "@/components/WelcomeBackPill";
import { MoodSelector } from "@/components/MoodSelector";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "wouter";
import { LogOut, BarChart3, ChevronRight, Check, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";
import type { MoodValue } from "@shared/schema";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const { data: wordGoalSettings } = useWordGoalSettings();
  const { data: todayProgress } = useTodayWordCount();
  const { data: streak } = useStreak();
  const { data: entries } = useEntries();
  const [category, setCategory] = useState<PromptCategory>("Life");
  const search = useSearch();
  const [useUrlPrompt, setUseUrlPrompt] = useState(true);
  
  const { showWelcome, dismissWelcome } = useWelcomeModal(isAuthenticated, user?.id);
  const [showReminderSetup, setShowReminderSetup] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(false);
  const [streakAlertDismissed, setStreakAlertDismissed] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [successStreakCount, setSuccessStreakCount] = useState(0);
  
  // Use server-calculated value to avoid timezone mismatches
  const hasWrittenToday = streak?.hasWrittenToday ?? false;
  
  // Track streak alert type to coordinate with WelcomeBackPill (only show one notification)
  const { alertType: streakAlertType } = useStreakAlert(
    streak?.currentStreak ?? 0, 
    hasWrittenToday, 
    user?.id
  );
  const isMilestoneActive = streakAlertType === "milestone" && !streakAlertDismissed;
  
  const monthlyWordCount = useMemo(() => {
    if (!entries) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return entries
      .filter(entry => new Date(entry.createdAt) >= startOfMonth)
      .reduce((sum, entry) => sum + entry.wordCount, 0);
  }, [entries]);
  const urlPromptId = useMemo(() => {
    if (!useUrlPrompt) return null;
    const params = new URLSearchParams(search);
    const id = params.get('prompt');
    return id ? parseInt(id) : null;
  }, [search, useUrlPrompt]);
  const { data: urlPrompt, isLoading: urlPromptLoading, isFetched: urlPromptFetched } = usePromptById(urlPromptId);
  const { data: randomPrompt, isLoading: randomPromptLoading, refetch: refetchPrompt } = useRandomPrompt(
    urlPromptId ? null : category
  );
  
  // Fallback to random prompt if URL prompt not found
  useEffect(() => {
    if (urlPromptId && urlPromptFetched && !urlPrompt) {
      setUseUrlPrompt(false);
    }
  }, [urlPromptId, urlPromptFetched, urlPrompt]);
  
  const prompt = urlPromptId ? urlPrompt : randomPrompt;
  const promptLoading = urlPromptId ? urlPromptLoading : randomPromptLoading;
  const { mutate: createEntry, isPending: isSaving } = useCreateEntry();
  const { mutate: updateMood } = useUpdateEntryMood();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<number | null>(null);

  const [content, setContent] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track if content has unsaved changes
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Warn before leaving with unsaved content
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && content.trim().length > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, content]);

  const handleStartTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true); // Mark as dirty when user types
    if (!hasStarted && e.target.value.length > 0) {
      setHasStarted(true);
    }
  };

  const handleSave = () => {
    if (!content.trim()) return;

    if (!isAuthenticated) {
      sessionStorage.setItem("draft_content", content);
      sessionStorage.setItem("draft_prompt", String(prompt?.id));
      setLocation("/auth");
      return;
    }

    createEntry({
      content,
      promptId: prompt?.id,
      wordCount: content.trim().split(/\s+/).length,
    }, {
      onSuccess: (entry) => {
        setIsDirty(false);
        setContent("");
        setSavedEntryId(entry.id);
        setShowMoodSelector(true);
        
        // Pre-calculate streak for celebration
        const newStreakCount = (streak?.currentStreak || 0) + (hasWrittenToday ? 0 : 1);
        setSuccessStreakCount(newStreakCount);
      },
      onError: (err) => {
        toast({
          title: "Error Saving",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const showCelebrationAndProceed = () => {
    setShowSuccessState(true);
    
    saveTimeoutRef.current = setTimeout(() => {
      setShowSuccessState(false);
      
      // Check if user needs reminder setup prompt
      const reminderSkipped = user?.id ? localStorage.getItem(`snw_reminder_setup_skipped_${user.id}`) : null;
      const hasRemindersEnabled = user?.reminderEnabled;
      
      if (!hasRemindersEnabled && !reminderSkipped) {
        setPendingNavigation(true);
        setShowReminderSetup(true);
      } else {
        setLocation("/dashboard");
      }
    }, 2500);
  };
  
  const handleMoodSelect = (mood: MoodValue) => {
    setShowMoodSelector(false);
    if (savedEntryId) {
      updateMood({ id: savedEntryId, mood });
    }
    showCelebrationAndProceed();
  };
  
  const handleMoodSkip = () => {
    setShowMoodSelector(false);
    showCelebrationAndProceed();
  };

  // Restore draft if returning from login
  useEffect(() => {
    const draft = sessionStorage.getItem("draft_content");
    if (draft && isAuthenticated) {
      setContent(draft);
      setHasStarted(true);
      setIsDirty(true); // Mark as dirty so unsaved warning still triggers
      sessionStorage.removeItem("draft_content");
    }
  }, [isAuthenticated]);
  
  const handleWelcomeClose = () => {
    dismissWelcome(user?.id);
  };
  
  const handleReminderClose = () => {
    setShowReminderSetup(false);
    if (pendingNavigation) {
      setPendingNavigation(false);
      setLocation("/dashboard");
    }
  };

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Mood Selector Overlay */}
      <MoodSelector
        isOpen={showMoodSelector}
        onSelect={handleMoodSelect}
        onSkip={handleMoodSkip}
      />
      
      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {showSuccessState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex p-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 mb-6"
              >
                <Check className="w-12 h-12" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-serif font-medium mb-2"
              >
                Entry saved!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground"
              >
                {successStreakCount > 1 
                  ? `Day ${successStreakCount}! You're building something great.`
                  : "Great start! Your writing journey begins."}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={handleWelcomeClose} 
        userName={user?.firstName || undefined}
      />
      <ReminderSetupModal 
        isOpen={showReminderSetup} 
        onClose={handleReminderClose}
        userEmail={user?.email || undefined}
        userId={user?.id}
      />
      
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src={logoBlack} alt="startwriting.now" className="h-8 dark:hidden" />
            <img src={logoWhite} alt="startwriting.now" className="h-8 hidden dark:block" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="link-dashboard">
                    <BarChart3 className="w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout()}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Value proposition for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-muted-foreground font-medium">
              3 minutes. One prompt. Start your writing habit today.
            </p>
          </motion.div>
        )}

        {/* Show StreakAlert for milestone celebrations; skip at-risk alerts when WelcomeBackPill handles them (user has entries) */}
        {isAuthenticated && !streakAlertDismissed && streak && (
          <StreakAlert
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            hasWrittenToday={hasWrittenToday}
            userId={user?.id}
            onDismiss={() => setStreakAlertDismissed(true)}
            skipAtRisk={!!(entries && entries.length > 0)}
          />
        )}
        
        {/* Empty state for first-time users */}
        {isAuthenticated && entries && entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10"
          >
            <p className="text-muted-foreground">
              Your first entry awaits. No pressure — just 3 minutes.
            </p>
          </motion.div>
        )}
        
        {/* Hide WelcomeBackPill when milestone alert is showing (milestones get the spotlight) */}
        {isAuthenticated && streak && entries && entries.length > 0 && !isMilestoneActive && (
          <WelcomeBackPill
            userName={user?.firstName || undefined}
            currentStreak={streak.currentStreak}
            totalEntries={entries.length}
            monthlyWordCount={monthlyWordCount}
            lastEntryDate={streak.lastEntryDate ? new Date(streak.lastEntryDate) : null}
            hasWrittenToday={hasWrittenToday}
          />
        )}
        
        {/* Prompt Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <PromptCard 
            prompt={prompt} 
            isLoading={promptLoading} 
            onRefresh={() => {
              setHasStarted(false);
              setContent("");
              setUseUrlPrompt(false);
              refetchPrompt();
            }}
            category={category}
            onCategoryChange={(newCategory) => {
              setUseUrlPrompt(false);
              setCategory(newCategory);
            }}
          />
        </motion.div>

        {/* Writing Area Card */}
        <motion.div 
          className="relative group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-10 shadow-sm">
            {/* Timer & Controls */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
              <CountdownTimer 
                durationSeconds={180}
                isRunning={hasStarted}
                onComplete={() => {}}
              />
              
              <div className="flex items-center gap-3">
                {isAuthenticated && wordGoalSettings?.dailyWordGoal ? (
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <div className="w-24">
                      <Progress 
                        value={Math.min(100, (((todayProgress || 0) + wordCount) / wordGoalSettings.dailyWordGoal) * 100)} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {(todayProgress || 0) + wordCount}/{wordGoalSettings.dailyWordGoal}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground">
                    {wordCount} words
                  </span>
                )}
                <div className="relative group">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || wordCount < 5}
                    className={`shadow-lg transition-all gap-2 ${
                      wordCount >= 5 
                        ? "shadow-primary/20 hover:shadow-primary/40" 
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    data-testid="button-save-entry"
                  >
                    {isSaving ? "Saving..." : (
                      <>
                        <Check className="w-4 h-4" />
                        Done
                      </>
                    )}
                  </Button>
                  {wordCount < 5 && (
                    <div className="absolute -bottom-8 right-0 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Write at least 5 words to save
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Textarea with animated cursor */}
            <div className="relative">
              {!content && (
                <div className="absolute top-0 left-0 pointer-events-none flex items-center text-xl md:text-2xl font-serif text-muted-foreground/30">
                  <motion.span
                    className="inline-block w-[2px] h-[1.2em] bg-primary mr-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
                  />
                  Start typing to begin the timer...
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleStartTyping}
                className="w-full min-h-[40vh] bg-transparent border-0 focus:ring-0 focus:outline-none text-xl md:text-2xl leading-relaxed resize-none selection:bg-primary/20 font-serif"
                spellCheck={false}
                data-testid="input-journal-entry"
              />
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="pt-6 pb-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground/60">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </p>
          <p className="text-sm text-muted-foreground/60">
            Created with Love by{" "}
            <a 
              href="https://mattrutherford.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Matt Rutherford
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

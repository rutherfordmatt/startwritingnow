import { useState, useRef, useEffect, useMemo } from "react";
import { useRandomPrompt, useCreateEntry, usePromptById, useStreak, useEntries } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { useWordGoalSettings, useTodayWordCount } from "@/hooks/use-word-goal";
import { PromptCard, type PromptCategory } from "@/components/PromptCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WelcomeModal, useWelcomeModal } from "@/components/WelcomeModal";
import { StreakAlert } from "@/components/StreakAlert";
import { ReminderSetupModal } from "@/components/ReminderSetupModal";
import { WelcomeBackPill } from "@/components/WelcomeBackPill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "wouter";
import { LogOut, BarChart3, ChevronRight, Check, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const { data: wordGoalSettings } = useWordGoalSettings();
  const { data: todayProgress } = useTodayWordCount();
  const { data: streak } = useStreak();
  const { data: entries } = useEntries();
  const [category, setCategory] = useState<PromptCategory>("Life");
  const search = useSearch();
  const [useUrlPrompt, setUseUrlPrompt] = useState(true);
  
  const { showWelcome, dismissWelcome } = useWelcomeModal(isAuthenticated);
  const [showReminderSetup, setShowReminderSetup] = useState(false);
  const [streakAlertDismissed, setStreakAlertDismissed] = useState(false);
  
  const hasWrittenToday = entries?.some(entry => {
    const entryDate = new Date(entry.createdAt).toDateString();
    return entryDate === new Date().toDateString();
  }) ?? false;
  
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
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [content, setContent] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleStartTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
      onSuccess: () => {
        toast({
          title: "Entry Saved",
          description: "Great job! Your thought has been captured.",
        });
        setLocation("/dashboard");
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

  // Restore draft if returning from login
  useEffect(() => {
    const draft = sessionStorage.getItem("draft_content");
    if (draft && isAuthenticated) {
      setContent(draft);
      setHasStarted(true);
      sessionStorage.removeItem("draft_content");
    }
  }, [isAuthenticated]);
  
  const handleWelcomeClose = () => {
    dismissWelcome();
    const reminderSkipped = localStorage.getItem("snw_reminder_setup_skipped");
    if (!reminderSkipped) {
      setShowReminderSetup(true);
    }
  };

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={handleWelcomeClose} 
        userName={user?.firstName || undefined}
      />
      <ReminderSetupModal 
        isOpen={showReminderSetup} 
        onClose={() => setShowReminderSetup(false)}
        userEmail={user?.email || undefined}
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
        {isAuthenticated && !streakAlertDismissed && streak && (
          <StreakAlert
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            hasWrittenToday={hasWrittenToday}
            onDismiss={() => setStreakAlertDismissed(true)}
          />
        )}
        
        {isAuthenticated && streak && entries && entries.length > 0 && (
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
                <AnimatePresence mode="wait">
                  {hasStarted && wordCount >= 5 && (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
                        data-testid="button-save-entry"
                      >
                        {isSaving ? "Saving..." : (
                          <>
                            <Check className="w-4 h-4" />
                            Done
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
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

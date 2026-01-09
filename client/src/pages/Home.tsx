import { useState, useRef, useEffect } from "react";
import { useRandomPrompt, useCreateEntry } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { PromptCard } from "@/components/PromptCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const [category, setCategory] = useState<"Life" | "Career">("Life");
  const { data: prompt, isLoading: promptLoading, refetch: refetchPrompt } = useRandomPrompt(category);
  const { mutate: createEntry, isPending: isSaving } = useCreateEntry();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [content, setContent] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
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
      // If not authenticated, save to local storage (optional enhancement) 
      // then redirect to login
      sessionStorage.setItem("draft_content", content);
      sessionStorage.setItem("draft_prompt", String(prompt?.id));
      window.location.href = "/api/login";
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
      setTimerComplete(true); // Assuming they already spent time writing
      sessionStorage.removeItem("draft_content");
    }
  }, [isAuthenticated]);

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const canSave = wordCount > 5 && (timerComplete || wordCount > 50);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-xl tracking-tight">startwriting.now</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                className="rounded-full w-10 h-10 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <a href="/api/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log In
            </a>
          )}
        </div>
      </nav>

      <main className="w-full max-w-3xl mx-auto px-4 pt-24 pb-32 min-h-screen flex flex-col">
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
              setTimerComplete(false);
              setContent("");
              refetchPrompt();
            }}
            category={category}
            onCategoryChange={setCategory}
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
                isRunning={hasStarted && !timerComplete}
                onComplete={() => setTimerComplete(true)}
              />
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground">
                  {wordCount} words
                </span>
                <AnimatePresence mode="wait">
                  {hasStarted && !timerComplete && wordCount >= 5 && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Button 
                        variant="outline"
                        onClick={() => setTimerComplete(true)}
                        className="gap-2"
                        data-testid="button-done"
                      >
                        <Check className="w-4 h-4" />
                        Done
                      </Button>
                    </motion.div>
                  )}
                  {canSave && (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        data-testid="button-save-entry"
                      >
                        {isSaving ? "Saving..." : (
                          <>
                            Save Entry <ChevronRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleStartTyping}
              placeholder="Start typing to begin the timer..."
              className="w-full min-h-[40vh] bg-transparent border-0 focus:ring-0 focus:outline-none text-xl md:text-2xl leading-relaxed resize-none placeholder:text-muted-foreground/30 selection:bg-primary/20 font-serif"
              spellCheck={false}
              data-testid="input-journal-entry"
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

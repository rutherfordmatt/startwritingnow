import { useState } from "react";
import { useEntries, useDeleteEntry } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { format } from "date-fns";
import { Download, BookOpen, ChevronDown, Trash2, FileText, FileType, Smile, CloudSun, Heart, Minus, AlertCircle, CloudRain, Zap } from "lucide-react";
import type { MoodValue } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MOOD_CONFIG: Record<MoodValue, { icon: typeof Smile; color: string; label: string }> = {
  happy: { icon: Smile, label: 'Happy', color: 'text-amber-500' },
  calm: { icon: CloudSun, label: 'Calm', color: 'text-sky-500' },
  grateful: { icon: Heart, label: 'Grateful', color: 'text-rose-500' },
  neutral: { icon: Minus, label: 'Neutral', color: 'text-slate-500' },
  anxious: { icon: AlertCircle, label: 'Anxious', color: 'text-orange-500' },
  sad: { icon: CloudRain, label: 'Sad', color: 'text-blue-500' },
  stressed: { icon: Zap, label: 'Stressed', color: 'text-purple-500' },
};

export default function Journal() {
  const { user } = useAuth();
  const { data: entries, isLoading } = useEntries();
  const { mutate: deleteEntry, isPending: isDeleting } = useDeleteEntry();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleExportTXT = async () => {
    try {
      const res = await fetch("/api/export/text", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-export-${format(new Date(), "yyyy-MM-dd")}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "Your journal entries have been downloaded as text." });
    } catch (err) {
      toast({ title: "Export Failed", description: err instanceof Error ? err.message : "Failed to export", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await fetch("/api/export/pdf", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-export-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "Your journal entries have been downloaded as PDF." });
    } catch (err) {
      toast({ title: "Export Failed", description: err instanceof Error ? err.message : "Failed to export", variant: "destructive" });
    }
  };

  const handleDelete = (id: number) => {
    deleteEntry(id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Entry has been removed." });
        if (expandedId === id) setExpandedId(null);
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">Your Journal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {entries?.length || 0} {entries?.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          {entries && entries.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" data-testid="button-export">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportTXT} className="gap-2" data-testid="button-export-txt">
                  <FileText className="w-4 h-4" />
                  Export as Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2" data-testid="button-export-pdf">
                  <FileType className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Entries List */}
        {!entries?.length ? (
          <div className="text-center py-16 bg-card/50 rounded-2xl border border-dashed border-border/50">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No entries yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">Start your writing journey today.</p>
            <Link href="/">
              <Button data-testid="button-start-writing">Start Writing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const isExpanded = expandedId === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="relative group"
                  data-testid={`entry-card-${entry.id}`}
                >
                  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-primary/20">
                    {/* Entry Header - Always visible */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="w-full text-left p-5 flex items-start justify-between gap-4"
                      data-testid={`button-expand-${entry.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                            {entry.prompt?.category || "Journal"}
                          </span>
                          <time className="text-xs text-muted-foreground font-mono">
                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                          </time>
                        </div>
                        <h3 className="font-serif text-lg font-medium text-foreground leading-snug line-clamp-2">
                          {entry.prompt?.content || "Free Writing"}
                        </h3>
                        {!isExpanded && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {entry.content.slice(0, 100)}...
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.mood && MOOD_CONFIG[entry.mood as MoodValue] && (() => {
                          const MoodIcon = MOOD_CONFIG[entry.mood as MoodValue].icon;
                          const moodLabel = MOOD_CONFIG[entry.mood as MoodValue].label;
                          return (
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <span className="cursor-default">
                                  <MoodIcon className={`w-4 h-4 ${MOOD_CONFIG[entry.mood as MoodValue].color}`} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left" sideOffset={5} className="text-xs z-50">
                                Feeling {moodLabel.toLowerCase()}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })()}
                        <span className="text-xs font-mono text-muted-foreground">{entry.wordCount} words</span>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border/30">
                            <div className="prose prose-sm dark:prose-invert max-w-none pt-4 font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {entry.content}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border/30">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                                    disabled={isDeleting}
                                    data-testid={`button-delete-${entry.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete your journal entry.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(entry.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 pb-4 text-center border-t border-border/30 space-y-2">
          <p className="text-sm text-muted-foreground/60 flex items-center justify-center gap-3">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <span>·</span>
            <Link href="/features" className="hover:text-foreground transition-colors" data-testid="link-features">
              Feature Requests
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

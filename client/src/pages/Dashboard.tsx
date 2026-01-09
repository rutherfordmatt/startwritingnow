import { useState } from "react";
import { useEntries, useStreak, useDeleteEntry } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { format } from "date-fns";
import { Download, Flame, Calendar, BookOpen, ChevronDown, Trash2, PenLine, LogOut, FileJson, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: streak, isLoading: streakLoading } = useStreak();
  const { mutate: deleteEntry, isPending: isDeleting } = useDeleteEntry();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleExportJSON = () => {
    if (!entries) return;
    const exportData = entries.map(e => ({
      date: format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm'),
      prompt: e.prompt?.content || 'Free Writing',
      category: e.prompt?.category || 'Journal',
      content: e.content,
      wordCount: e.wordCount,
    }));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `journal_export_${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Exported", description: "Your journal entries have been downloaded as JSON." });
  };

  const handleExportTXT = () => {
    if (!entries) return;
    let textContent = "JOURNAL EXPORT\n";
    textContent += `Exported: ${format(new Date(), 'MMMM d, yyyy')}\n`;
    textContent += "=".repeat(50) + "\n\n";
    
    entries.forEach((e, index) => {
      textContent += `Entry ${index + 1}\n`;
      textContent += "-".repeat(30) + "\n";
      textContent += `Date: ${format(new Date(e.createdAt), 'MMMM d, yyyy h:mm a')}\n`;
      textContent += `Category: ${e.prompt?.category || 'Journal'}\n`;
      textContent += `Prompt: ${e.prompt?.content || 'Free Writing'}\n`;
      textContent += `Word Count: ${e.wordCount}\n\n`;
      textContent += e.content + "\n\n";
      textContent += "=".repeat(50) + "\n\n";
    });
    
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `journal_export_${format(new Date(), 'yyyy-MM-dd')}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Exported", description: "Your journal entries have been downloaded as TXT." });
  };

  const handleExportPDF = () => {
    if (!entries) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPos = 20;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Journal Export", margin, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Exported: ${format(new Date(), 'MMMM d, yyyy')}`, margin, yPos);
    yPos += 15;
    
    entries.forEach((e, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${e.prompt?.category || 'Journal'} - ${format(new Date(e.createdAt), 'MMM d, yyyy')}`, margin, yPos);
      yPos += 7;
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      const promptLines = doc.splitTextToSize(e.prompt?.content || 'Free Writing', maxWidth);
      doc.text(promptLines, margin, yPos);
      yPos += promptLines.length * 5 + 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const contentLines = doc.splitTextToSize(e.content, maxWidth);
      
      contentLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(`${e.wordCount} words`, margin, yPos);
      doc.setTextColor(0);
      yPos += 15;
    });
    
    doc.save(`journal_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: "Exported", description: "Your journal entries have been downloaded as PDF." });
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

  if (entriesLoading || streakLoading) {
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
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold hover:text-primary transition-colors">
            startwriting.now
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" data-testid="button-export">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportJSON} className="gap-2" data-testid="button-export-json">
                  <FileJson className="w-4 h-4" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportTXT} className="gap-2" data-testid="button-export-txt">
                  <FileText className="w-4 h-4" />
                  Export as TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2" data-testid="button-export-pdf">
                  <FileType className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/">
              <Button className="gap-2" data-testid="button-write-new">
                <PenLine className="w-4 h-4" />
                <span className="hidden sm:inline">Write</span>
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
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Streak Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm text-center"
          >
            <div className="inline-flex p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 mb-3">
              <Flame className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Streak</p>
            <h3 className="text-3xl font-bold mt-1">{streak?.currentStreak || 0}</h3>
            <p className="text-xs text-muted-foreground">days</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm text-center"
          >
            <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Entries</p>
            <h3 className="text-3xl font-bold mt-1">{entries?.length || 0}</h3>
            <p className="text-xs text-muted-foreground">written</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm text-center"
          >
            <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best Streak</p>
            <h3 className="text-3xl font-bold mt-1">{streak?.longestStreak || 0}</h3>
            <p className="text-xs text-muted-foreground">days</p>
          </motion.div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Journal Entries</h2>

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
        </div>
      </main>
    </div>
  );
}

import { useEntries, useStreak } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Download, Flame, Calendar, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: streak, isLoading: streakLoading } = useStreak();

  const handleExport = () => {
    if (!entries) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `journal_export_${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (entriesLoading || streakLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold hover:text-primary transition-colors">startwriting.now</Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 hidden sm:flex">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              Write New Entry
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border shadow-sm flex items-center gap-4"
          >
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
              <h3 className="text-2xl font-bold">{streak?.currentStreak || 0} Days</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border shadow-sm flex items-center gap-4"
          >
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Entries</p>
              <h3 className="text-2xl font-bold">{entries?.length || 0}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border shadow-sm flex items-center gap-4"
          >
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Longest Streak</p>
              <h3 className="text-2xl font-bold">{streak?.longestStreak || 0} Days</h3>
            </div>
          </motion.div>
        </div>

        {/* Entries List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Entries
          </h2>

          {!entries?.length ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <h3 className="text-lg font-medium text-foreground">No entries yet</h3>
              <p className="text-muted-foreground mt-2 mb-6">Start your writing journey today.</p>
              <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2">
                Start Writing
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="group bg-card hover:bg-card/50 border hover:border-primary/20 rounded-xl p-6 shadow-sm transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                        {entry.prompt?.category || "Journal"}
                      </span>
                      <h3 className="text-lg font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                        {entry.prompt?.content || "Free Writing"}
                      </h3>
                    </div>
                    <time className="text-sm text-muted-foreground whitespace-nowrap shrink-0 font-mono">
                      {format(new Date(entry.createdAt), "MMM d, yyyy • h:mm a")}
                    </time>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-3 font-serif">
                    {entry.content}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

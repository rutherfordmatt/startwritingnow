import { useState, useEffect } from "react";
import { useEntries, useStreak, useDeleteEntry, useDeleteAccount } from "@/hooks/use-entries";
import { useAuth } from "@/hooks/use-auth";
import { useReminderSettings, useUpdateReminderSettings, useSendTestReminder } from "@/hooks/use-reminders";
import { useWordGoalSettings, useUpdateWordGoal } from "@/hooks/use-word-goal";
import { useEmailVerificationStatus } from "@/hooks/use-email-verification";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WritingCalendar } from "@/components/WritingCalendar";
import { VerificationBanner } from "@/components/VerificationBanner";
import { Achievements } from "@/components/Achievements";
import { format } from "date-fns";
import { Download, Flame, Calendar, BookOpen, ChevronDown, ChevronRight, Trash2, PenLine, LogOut, FileText, FileType, Bell, Mail, Clock, Send, AlertTriangle, Target, Share2, Smile, CloudSun, Heart, Minus, AlertCircle, CloudRain, Zap } from "lucide-react";
import type { MoodValue } from "@shared/schema";
import { SiX, SiFacebook, SiThreads, SiBluesky } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";
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

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: `${hour.toString().padStart(2, "0")}:00`,
  label: `${hour === 0 ? "12" : hour > 12 ? hour - 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}`,
}));

const MOOD_CONFIG: Record<MoodValue, { icon: typeof Smile; color: string; label: string }> = {
  happy: { icon: Smile, label: 'Happy', color: 'text-amber-500' },
  calm: { icon: CloudSun, label: 'Calm', color: 'text-sky-500' },
  grateful: { icon: Heart, label: 'Grateful', color: 'text-rose-500' },
  neutral: { icon: Minus, label: 'Neutral', color: 'text-slate-500' },
  anxious: { icon: AlertCircle, label: 'Anxious', color: 'text-orange-500' },
  sad: { icon: CloudRain, label: 'Sad', color: 'text-blue-500' },
  stressed: { icon: Zap, label: 'Stressed', color: 'text-purple-500' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: streak, isLoading: streakLoading } = useStreak();
  const { mutate: deleteEntry, isPending: isDeleting } = useDeleteEntry();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();
  const { data: reminderSettings, isLoading: reminderLoading } = useReminderSettings();
  const { mutate: updateReminders, isPending: isUpdatingReminders } = useUpdateReminderSettings();
  const { mutate: sendTestReminder, isPending: isSendingTest } = useSendTestReminder();
  const { data: verificationStatus } = useEmailVerificationStatus();
  const { data: wordGoalSettings } = useWordGoalSettings();
  const { mutate: updateWordGoal, isPending: isUpdatingWordGoal } = useUpdateWordGoal();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showWordGoalSettings, setShowWordGoalSettings] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [wordGoalInput, setWordGoalInput] = useState("");
  
  useEffect(() => {
    if (reminderSettings?.email) {
      setEmailInput(reminderSettings.email);
    }
  }, [reminderSettings?.email]);
  
  useEffect(() => {
    if (wordGoalSettings?.dailyWordGoal) {
      setWordGoalInput(String(wordGoalSettings.dailyWordGoal));
    }
  }, [wordGoalSettings?.dailyWordGoal]);
  
  const wordGoalProgress = wordGoalSettings?.dailyWordGoal 
    ? Math.min(100, (wordGoalSettings.todayWordCount / wordGoalSettings.dailyWordGoal) * 100)
    : 0;

  const getShareText = (type: 'streak' | 'entries' | 'best') => {
    const appUrl = window.location.origin;
    switch (type) {
      case 'streak':
        return `I'm on a ${streak?.currentStreak || 0} day writing streak with startwriting.now! Building my daily writing habit one prompt at a time. ${appUrl}`;
      case 'entries':
        return `I've written ${entries?.length || 0} journal entries with startwriting.now! Journaling has become my daily superpower. ${appUrl}`;
      case 'best':
        return `My best writing streak is ${streak?.longestStreak || 0} days with startwriting.now! Celebrating the power of consistent writing. ${appUrl}`;
    }
  };

  const shareToFacebook = (type: 'streak' | 'entries' | 'best') => {
    const url = encodeURIComponent(window.location.origin);
    const quote = encodeURIComponent(getShareText(type));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=550,height=420');
  };

  const shareToThreads = (type: 'streak' | 'entries' | 'best') => {
    const text = encodeURIComponent(getShareText(type));
    window.open(`https://www.threads.net/intent/post?text=${text}`, '_blank', 'width=550,height=420');
  };

  const shareToBluesky = (type: 'streak' | 'entries' | 'best') => {
    const text = encodeURIComponent(getShareText(type));
    window.open(`https://bsky.app/intent/compose?text=${text}`, '_blank', 'width=550,height=420');
  };

  const shareToTwitter = (type: 'streak' | 'entries' | 'best') => {
    const text = encodeURIComponent(getShareText(type));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=420');
  };

  const handleExportTXT = async () => {
    try {
      const response = await fetch("/api/export/text", { credentials: "include" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to export");
      }
      const blob = await response.blob();
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
      const response = await fetch("/api/export/pdf", { credentials: "include" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to export");
      }
      const blob = await response.blob();
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

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast({ title: "Account Deleted", description: "Your account has been permanently removed." });
        setLocation("/");
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
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src={logoBlack} alt="startwriting.now" className="h-10 dark:hidden" />
            <img src={logoWhite} alt="startwriting.now" className="h-10 hidden dark:block" />
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
            <Link href="/">
              <Button className="gap-2" data-testid="button-write-new">
                <PenLine className="w-5 h-5" />
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
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Email Verification Banner */}
        {reminderSettings?.email && verificationStatus && !verificationStatus.isVerified && (
          <VerificationBanner email={reminderSettings.email} />
        )}

        {/* Write Today CTA - only show if hasn't written today */}
        {streak && !streak.hasWrittenToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link href="/">
              <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer group" data-testid="cta-write-today">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <PenLine className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Ready to write?</h3>
                    <p className="text-sm text-muted-foreground">
                      {streak.currentStreak > 0 
                        ? `Keep your ${streak.currentStreak}-day streak going!`
                        : "Start your writing journey today"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        )}

        {/* Streak Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm text-center relative group"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  data-testid="button-share-streak"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => shareToFacebook('streak')} className="gap-2" data-testid="button-share-streak-facebook">
                  <SiFacebook className="w-4 h-4" />
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToThreads('streak')} className="gap-2" data-testid="button-share-streak-threads">
                  <SiThreads className="w-4 h-4" />
                  Share on Threads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToBluesky('streak')} className="gap-2" data-testid="button-share-streak-bluesky">
                  <SiBluesky className="w-4 h-4" />
                  Share on Bluesky
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToTwitter('streak')} className="gap-2" data-testid="button-share-streak-twitter">
                  <SiX className="w-4 h-4" />
                  Share on X
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm text-center relative group"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  data-testid="button-share-entries"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => shareToFacebook('entries')} className="gap-2" data-testid="button-share-entries-facebook">
                  <SiFacebook className="w-4 h-4" />
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToThreads('entries')} className="gap-2" data-testid="button-share-entries-threads">
                  <SiThreads className="w-4 h-4" />
                  Share on Threads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToBluesky('entries')} className="gap-2" data-testid="button-share-entries-bluesky">
                  <SiBluesky className="w-4 h-4" />
                  Share on Bluesky
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToTwitter('entries')} className="gap-2" data-testid="button-share-entries-twitter">
                  <SiX className="w-4 h-4" />
                  Share on X
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm text-center relative group"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  data-testid="button-share-best"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => shareToFacebook('best')} className="gap-2" data-testid="button-share-best-facebook">
                  <SiFacebook className="w-4 h-4" />
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToThreads('best')} className="gap-2" data-testid="button-share-best-threads">
                  <SiThreads className="w-4 h-4" />
                  Share on Threads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToBluesky('best')} className="gap-2" data-testid="button-share-best-bluesky">
                  <SiBluesky className="w-4 h-4" />
                  Share on Bluesky
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToTwitter('best')} className="gap-2" data-testid="button-share-best-twitter">
                  <SiX className="w-4 h-4" />
                  Share on X
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best Streak</p>
            <h3 className="text-3xl font-bold mt-1">{streak?.longestStreak || 0}</h3>
            <p className="text-xs text-muted-foreground">days</p>
          </motion.div>
        </div>

        {/* Writing Calendar */}
        {entries && entries.length > 0 && (
          <div className="mb-10">
            <WritingCalendar entries={entries} daysToShow={30} />
          </div>
        )}

        {/* Achievements Section */}
        <div className="mb-10">
          <Achievements />
        </div>

        {/* Reminder Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm mb-10"
        >
          <button
            onClick={() => setShowReminderSettings(!showReminderSettings)}
            className="w-full flex items-center justify-between"
            data-testid="button-toggle-reminders"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-foreground">Daily Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  {reminderSettings?.enabled 
                    ? `Enabled - ${reminderSettings.time}` 
                    : "Get a friendly nudge to write"}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${showReminderSettings ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showReminderSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-border/30 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="reminder-toggle" className="font-medium">Enable daily reminders</Label>
                    </div>
                    <Switch
                      id="reminder-toggle"
                      checked={reminderSettings?.enabled ?? false}
                      disabled={isUpdatingReminders || !emailInput}
                      onCheckedChange={(checked) => {
                        updateReminders({ enabled: checked }, {
                          onSuccess: () => {
                            toast({ 
                              title: checked ? "Reminders enabled" : "Reminders disabled",
                              description: checked ? "You'll get daily prompts to write." : "You won't receive reminder emails."
                            });
                          }
                        });
                      }}
                      data-testid="switch-reminder-toggle"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="reminder-email" className="font-medium">Email address</Label>
                    </div>
                    <Input
                      id="reminder-email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onBlur={() => {
                        if (emailInput !== (reminderSettings?.email ?? "")) {
                          updateReminders({ email: emailInput || null });
                        }
                      }}
                      data-testid="input-reminder-email"
                    />
                    {!emailInput && (
                      <p className="text-xs text-muted-foreground">Add your email to enable reminders</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Label className="font-medium">Reminder time</Label>
                      </div>
                      <Select
                        value={reminderSettings?.time ?? "09:00"}
                        onValueChange={(value) => updateReminders({ time: value })}
                        disabled={isUpdatingReminders}
                      >
                        <SelectTrigger data-testid="select-reminder-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Timezone</Label>
                      <Select
                        value={reminderSettings?.timezone ?? "America/New_York"}
                        onValueChange={(value) => updateReminders({ timezone: value })}
                        disabled={isUpdatingReminders}
                      >
                        <SelectTrigger data-testid="select-reminder-timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {emailInput && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          sendTestReminder(undefined, {
                            onSuccess: (data) => {
                              toast({
                                title: data.success ? "Test sent!" : "Couldn't send",
                                description: data.message,
                                variant: data.success ? "default" : "destructive"
                              });
                            },
                            onError: () => {
                              toast({
                                title: "Error",
                                description: "Failed to send test reminder",
                                variant: "destructive"
                              });
                            }
                          });
                        }}
                        disabled={isSendingTest}
                        data-testid="button-send-test-reminder"
                      >
                        <Send className="w-4 h-4" />
                        {isSendingTest ? "Sending..." : "Send test reminder"}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Word Goal Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm mb-10"
        >
          <button
            onClick={() => setShowWordGoalSettings(!showWordGoalSettings)}
            className="w-full flex items-center justify-between"
            data-testid="button-toggle-word-goal"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-foreground">Daily Word Goal</h3>
                <p className="text-sm text-muted-foreground">
                  {wordGoalSettings?.dailyWordGoal 
                    ? `${wordGoalSettings.todayWordCount}/${wordGoalSettings.dailyWordGoal} words today` 
                    : "Set a target to stay motivated"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {wordGoalSettings?.dailyWordGoal && (
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${wordGoalProgress}%` }}
                  />
                </div>
              )}
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${showWordGoalSettings ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {showWordGoalSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-border/30 space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="word-goal-input" className="font-medium">Daily word target</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="word-goal-input"
                        type="number"
                        min="0"
                        placeholder="e.g. 100"
                        value={wordGoalInput}
                        onChange={(e) => setWordGoalInput(e.target.value)}
                        data-testid="input-word-goal"
                        className="max-w-[150px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const goal = wordGoalInput ? parseInt(wordGoalInput) : null;
                          updateWordGoal({ dailyWordGoal: goal }, {
                            onSuccess: () => {
                              toast({ 
                                title: goal ? "Goal set!" : "Goal cleared",
                                description: goal ? `Aim for ${goal} words each day.` : "No daily word goal set."
                              });
                            }
                          });
                        }}
                        disabled={isUpdatingWordGoal}
                        data-testid="button-save-word-goal"
                      >
                        {isUpdatingWordGoal ? "Saving..." : "Save"}
                      </Button>
                      {wordGoalSettings?.dailyWordGoal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setWordGoalInput("");
                            updateWordGoal({ dailyWordGoal: null }, {
                              onSuccess: () => {
                                toast({ 
                                  title: "Goal cleared",
                                  description: "No daily word goal set."
                                });
                              }
                            });
                          }}
                          disabled={isUpdatingWordGoal}
                          data-testid="button-clear-word-goal"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set a daily word count target to track your writing progress
                    </p>
                  </div>

                  {wordGoalSettings?.dailyWordGoal && (
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Today's progress</span>
                        <span className="font-medium">
                          {wordGoalSettings.todayWordCount} / {wordGoalSettings.dailyWordGoal} words
                          {wordGoalProgress >= 100 && " - Goal reached!"}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${wordGoalProgress >= 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${wordGoalProgress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
                          {entry.mood && MOOD_CONFIG[entry.mood as MoodValue] && (() => {
                            const MoodIcon = MOOD_CONFIG[entry.mood as MoodValue].icon;
                            const moodLabel = MOOD_CONFIG[entry.mood as MoodValue].label;
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">
                                    <MoodIcon className={`w-4 h-4 ${MOOD_CONFIG[entry.mood as MoodValue].color}`} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
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
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-border/30"
        >
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  disabled={isDeletingAccount}
                  data-testid="button-delete-account"
                >
                  {isDeletingAccount ? "Deleting..." : "Delete My Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you certain?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All your journal entries will be removed. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

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

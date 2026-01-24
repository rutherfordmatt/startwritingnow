import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Clock, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUpdateReminderSettings } from "@/hooks/use-reminders";
import { useToast } from "@/hooks/use-toast";

interface ReminderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userId?: string;
}

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

export function ReminderSetupModal({ isOpen, onClose, userEmail, userId }: ReminderSetupModalProps) {
  const [email, setEmail] = useState(userEmail || "");
  const [time, setTime] = useState("09:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const { mutate: updateReminders, isPending } = useUpdateReminderSettings();
  const { toast } = useToast();

  const handleSetup = () => {
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    updateReminders({
      enabled: true,
      time,
      timezone,
      email: email.trim(),
    }, {
      onSuccess: () => {
        toast({ 
          title: "Reminders enabled!", 
          description: "You'll receive a daily reminder to write." 
        });
        onClose();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleSkip = () => {
    if (userId) {
      localStorage.setItem(`snw_reminder_setup_skipped_${userId}`, "true");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-reminder-setup">
        <DialogHeader className="text-center sm:text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4"
          >
            <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <Bell className="w-8 h-8" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-serif">Stay on track</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get a friendly daily reminder to keep your writing habit strong.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="reminder-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-reminder-email"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Time
              </Label>
              <Select value={time} onValueChange={setTime}>
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
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
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
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
            data-testid="button-skip-reminders"
          >
            Maybe later
          </Button>
          <Button onClick={handleSetup} disabled={isPending} className="gap-2" data-testid="button-enable-reminders">
            {isPending ? "Setting up..." : "Enable Reminders"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

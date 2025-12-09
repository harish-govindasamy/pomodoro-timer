"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Github,
  Send,
  Shield,
  Sparkles,
  Heart,
  Info,
  HelpCircle,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { useOnboarding, ONBOARDING_STORAGE_KEY } from "@/components/Onboarding";
import { exportData, importData, clearAllData } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

// Modal content components
function AboutContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Growth Mindset Academy</h3>
          <p className="text-muted-foreground text-xs">Est. 2021</p>
        </div>
      </div>

      <p className="text-muted-foreground">
        We started with a simple mission:
        <span className="text-foreground font-medium">
          {" "}
          to help people break free from procrastination and unlock their true
          potential.
        </span>
      </p>

      <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
        <p className="italic text-foreground text-xs">
          "The secret of getting ahead is getting started."
        </p>
        <p className="text-muted-foreground mt-1 text-xs">— Mark Twain</p>
      </div>

      <p className="text-muted-foreground">
        Every great achievement starts with a single focused session. You have
        the power to transform your productivity, one pomodoro at a time. 🚀
      </p>

      <div className="flex items-center gap-2 pt-2 text-muted-foreground text-xs">
        <Heart className="w-3 h-3 text-red-500" />
        <span>Built with love for focused minds</span>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Privacy Policy</h3>
          <p className="text-muted-foreground text-xs">
            Your data, your control
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-foreground mb-1">🔒 Data Storage</h4>
          <p className="text-muted-foreground text-xs">
            All data is stored{" "}
            <span className="text-foreground font-medium">
              locally on your device
            </span>
            . We don't collect or transmit personal data.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-1">🚫 No Tracking</h4>
          <p className="text-muted-foreground text-xs">
            We don't use cookies, analytics, or tracking. Your data remains
            private.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-1">🌐 Open Source</h4>
          <p className="text-muted-foreground text-xs">
            Review our code on GitHub to verify our privacy practices.
          </p>
        </div>
      </div>

      <div className="p-3 bg-green-500/10 rounded-lg">
        <p className="text-green-700 dark:text-green-400 font-medium text-xs">
          ✓ Your privacy is our priority.
        </p>
      </div>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Get in Touch</h3>
          <p className="text-muted-foreground text-xs">
            We'd love to hear from you
          </p>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Have questions or suggestions? Reach out through the channels below!
      </p>

      <div className="space-y-2">
        <a
          href="https://t.me/G_Harish"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Telegram</p>
            <p className="text-muted-foreground text-xs">@G_Harish</p>
          </div>
        </a>

        <a
          href="https://github.com/harish-govindasamy/pomodoro-timer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <Github className="w-4 h-4 text-background" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">GitHub</p>
            <p className="text-muted-foreground text-xs">
              Contribute to the project
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}

interface SettingsPageProps {
  onBack?: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSetting } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const [volume, setVolume] = useState(80);
  const [modalOpen, setModalOpen] = useState<
    "about" | "privacy" | "contact" | null
  >(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  const handleReplayOnboarding = () => {
    // Remove the onboarding completion flag
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      // Reload to trigger onboarding
      window.location.reload();
    }
  };

  const handleExportData = () => {
    try {
      exportData();
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await importData(file);
        if (success) {
          toast({
            title: "Data Imported",
            description: "Your data has been imported. Reloading...",
          });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({
            title: "Import Failed",
            description: "Invalid file format. Please use a valid backup file.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      clearAllData();
      toast({
        title: "Data Cleared",
        description: "All data has been cleared. Reloading...",
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleFocusTimeChange = (delta: number) => {
    const newValue = Math.max(5, Math.min(60, settings.focusTime + delta));
    updateSetting("focusTime", newValue);
  };

  const handleShortBreakChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(30, settings.shortBreakTime + delta));
    updateSetting("shortBreakTime", newValue);
  };

  const handleLongBreakChange = (delta: number) => {
    const newValue = Math.max(5, Math.min(60, settings.longBreakTime + delta));
    updateSetting("longBreakTime", newValue);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border">
        {onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Timer Section */}
        <div className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Timer
          </h2>
          <div className="space-y-3">
            <SettingRow
              label="Pomodoro"
              value={`${settings.focusTime} min`}
              onIncrement={() => handleFocusTimeChange(5)}
              onDecrement={() => handleFocusTimeChange(-5)}
            />
            <SettingRow
              label="Short Break"
              value={`${settings.shortBreakTime} min`}
              onIncrement={() => handleShortBreakChange(1)}
              onDecrement={() => handleShortBreakChange(-1)}
            />
            <SettingRow
              label="Long Break"
              value={`${settings.longBreakTime} min`}
              onIncrement={() => handleLongBreakChange(5)}
              onDecrement={() => handleLongBreakChange(-5)}
            />
          </div>
        </div>

        {/* Auto Start Section */}
        <div className="p-4 border-t border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Auto start Breaks?</span>
              <Switch
                checked={settings.autoStartBreak}
                onCheckedChange={(checked) =>
                  updateSetting("autoStartBreak", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Auto start Pomodoros?</span>
              <Switch
                checked={settings.autoStartNextSession}
                onCheckedChange={(checked) =>
                  updateSetting("autoStartNextSession", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="p-4 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Sound</span>
              <Button variant="ghost" className="text-muted-foreground">
                {settings.alarmSound.charAt(0).toUpperCase() +
                  settings.alarmSound.slice(1)}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Volume</span>
                <span className="text-muted-foreground">{volume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={(val) => setVolume(val[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="p-4 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Appearance
          </h2>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              <Sun className="w-4 h-4 mr-2" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-2" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Auto
            </Button>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="p-4 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Data Management
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              onClick={handleExportData}
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-muted-foreground" />
                <span>Export Data</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              onClick={handleImportData}
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span>Import Data</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12 text-destructive hover:text-destructive"
              onClick={handleClearData}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* General Section */}
        <div className="p-4 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            General
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              onClick={handleReplayOnboarding}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>Replay Tutorial</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              onClick={() => setModalOpen("about")}
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span>About</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              onClick={() => setModalOpen("privacy")}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              onClick={() => setModalOpen("contact")}
            >
              <div className="flex items-center gap-3">
                <Send className="w-4 h-4 text-muted-foreground" />
                <span>Contact Us</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <a
              href="https://github.com/harish-govindasamy/pomodoro-timer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="w-full justify-between h-12">
                <div className="flex items-center gap-3">
                  <Github className="w-4 h-4 text-muted-foreground" />
                  <span>Contribute on GitHub</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p className="font-medium">© 2025 Growth Mindset Academy</p>
          <p className="mt-1 text-xs">Version 1.0.0</p>
        </div>
      </div>

      {/* Modals */}
      <Dialog
        open={modalOpen === "about"}
        onOpenChange={(open) => !open && setModalOpen(null)}
      >
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>About Us</DialogTitle>
          </DialogHeader>
          <AboutContent />
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalOpen === "privacy"}
        onOpenChange={(open) => !open && setModalOpen(null)}
      >
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <PrivacyContent />
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalOpen === "contact"}
        onOpenChange={(open) => !open && setModalOpen(null)}
      >
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact</DialogTitle>
          </DialogHeader>
          <ContactContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

function SettingRow({
  label,
  value,
  onIncrement,
  onDecrement,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-16 text-right">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDecrement}
          className="w-8 h-8 rounded-full bg-muted"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onIncrement}
          className="w-8 h-8 rounded-full bg-muted"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

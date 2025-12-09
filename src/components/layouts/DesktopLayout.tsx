"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useStatsStore } from "@/store/statsStore";
import { useTheme } from "next-themes";

import { EnhancedTimerDisplay } from "@/components/Timer/EnhancedTimerDisplay";
import { DesktopTaskList } from "@/components/Tasks/DesktopTaskList";
import { EnhancedStats } from "@/components/EnhancedStats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Timer,
  Target,
  BarChart3,
  Volume2,
  Bell,
  Minus,
  Plus,
  Heart,
  Github,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Modal content components
function AboutContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Growth Mindset Academy</h3>
          <p className="text-muted-foreground">Est. 2021</p>
        </div>
      </div>

      <p className="text-muted-foreground">
        We started Growth Mindset Academy with a simple yet powerful mission:
        <span className="text-foreground font-medium">
          {" "}
          to help people break free from procrastination and unlock their true
          potential through focused, consistent action.
        </span>
      </p>

      <p className="text-muted-foreground">
        We've all been there — staring at a task, knowing we should start, but
        somehow finding ourselves scrolling through social media or "just
        checking one more thing." That cycle of guilt and unproductivity? We
        built Pomofocus to break it.
      </p>

      <div className="p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
        <p className="italic text-foreground">
          "The secret of getting ahead is getting started. The secret of getting
          started is breaking your complex overwhelming tasks into small
          manageable tasks, and starting on the first one."
        </p>
        <p className="text-muted-foreground mt-2 text-xs">— Mark Twain</p>
      </div>

      <p className="text-muted-foreground">
        Every great achievement starts with a single focused session. Whether
        you're a student preparing for exams, a professional tackling a big
        project, or a creator working on your passion —{" "}
        <span className="text-foreground font-medium">
          you have the power to transform your productivity, one pomodoro at a
          time.
        </span>
      </p>

      <p className="text-muted-foreground">
        Remember: It's not about being perfect. It's about being consistent.
        Start today. Start now. Your future self will thank you. 🚀
      </p>

      <div className="flex items-center gap-2 pt-4 text-muted-foreground">
        <Heart className="w-4 h-4 text-red-500" />
        <span>Built with love for focused minds worldwide</span>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Privacy Policy</h3>
          <p className="text-muted-foreground">Your data, your control</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">
            🔒 Data Storage
          </h4>
          <p className="text-muted-foreground">
            All your data (tasks, settings, statistics) is stored{" "}
            <span className="text-foreground font-medium">
              locally on your device
            </span>{" "}
            using browser localStorage. We do not collect, store, or transmit
            any of your personal data to external servers.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2">🚫 No Tracking</h4>
          <p className="text-muted-foreground">
            We don't use cookies, analytics, or any tracking mechanisms. Your
            focus sessions and productivity data remain completely private.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2">
            💾 Data Persistence
          </h4>
          <p className="text-muted-foreground">
            Your data persists in your browser. Clearing browser data will reset
            your Pomofocus data. We recommend using the export feature for
            backups.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2">🌐 Open Source</h4>
          <p className="text-muted-foreground">
            Pomofocus is open source. You can review our code on GitHub to
            verify our privacy practices.
          </p>
        </div>
      </div>

      <div className="p-4 bg-green-500/10 rounded-xl">
        <p className="text-green-700 dark:text-green-400 font-medium">
          ✓ Your privacy is our priority. Focus on your work, not on data
          concerns.
        </p>
      </div>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Send className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Get in Touch</h3>
          <p className="text-muted-foreground">We'd love to hear from you</p>
        </div>
      </div>

      <p className="text-muted-foreground">
        Have questions, suggestions, or just want to say hi? Reach out to us
        through any of the channels below. We're always happy to connect with
        our community!
      </p>

      <div className="space-y-3">
        <a
          href="https://t.me/G_Harish"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Telegram</p>
            <p className="text-muted-foreground">@G_Harish</p>
          </div>
          <span className="text-blue-500 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>

        <a
          href="https://github.com/harish-govindasamy/pomodoro-timer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
            <Github className="w-5 h-5 text-background" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">GitHub</p>
            <p className="text-muted-foreground">Contribute to the project</p>
          </div>
          <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>
      </div>

      <div className="p-4 bg-primary/5 rounded-xl">
        <p className="text-muted-foreground">
          <span className="text-foreground font-medium">
            Open Source Contributors Welcome!
          </span>
          <br />
          Found a bug or have a feature idea? Open an issue or submit a PR on
          GitHub.
        </p>
      </div>
    </div>
  );
}

export function DesktopLayout() {
  const { loadTasks } = useTaskStore();
  const { settings, loadSettings, updateSetting } = useSettingsStore();
  const { loadStats, today } = useStatsStore();
  const { theme, setTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<
    "tasks" | "stats" | "settings"
  >("tasks");
  const [modalOpen, setModalOpen] = useState<
    "about" | "privacy" | "contact" | null
  >(null);

  useEffect(() => {
    loadTasks();
    loadSettings();
    loadStats();
  }, [loadTasks, loadSettings, loadStats]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Modals */}
      <Dialog
        open={modalOpen === "about"}
        onOpenChange={(open) => !open && setModalOpen(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">About Us</DialogTitle>
          </DialogHeader>
          <AboutContent />
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalOpen === "privacy"}
        onOpenChange={(open) => !open && setModalOpen(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Privacy Policy</DialogTitle>
          </DialogHeader>
          <PrivacyContent />
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalOpen === "contact"}
        onOpenChange={(open) => !open && setModalOpen(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Contact</DialogTitle>
          </DialogHeader>
          <ContactContent />
        </DialogContent>
      </Dialog>

      {/* Header - Minimalistic, no borders */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Pomofocus" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Pomofocus
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Growth Mindset Academy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {today.pomodorosCompleted} sessions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="font-medium">
                  {today.totalFocusTimeMinutes}m focused
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setTheme("light")}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-4 h-4" />
              </Button>
              <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setTheme("system")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex-1">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - Timer */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <Card className="p-6 sticky top-24">
              <EnhancedTimerDisplay size="large" showTaskCard={true} />
            </Card>
          </div>

          {/* Right Panel - Tabs */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <Tabs
              value={activePanel}
              onValueChange={(v) => setActivePanel(v as typeof activePanel)}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="mt-0">
                <Card className="p-6">
                  <DesktopTaskList />
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <Card className="p-6">
                  <EnhancedStats />
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card className="p-6">
                  <SettingsPanel />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer - Minimalistic, no borders */}
      <footer className="mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              © 2025 Growth Mindset Academy
            </p>
            <div className="flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => setModalOpen("about")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button
                onClick={() => setModalOpen("privacy")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => setModalOpen("contact")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </button>
              <a
                href="https://github.com/harish-govindasamy/pomodoro-timer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                Contribute
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SettingsPanel() {
  const { settings, updateSetting } = useSettingsStore();
  const [volume, setVolume] = useState(80);

  return (
    <div className="space-y-8">
      {/* Timer Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Timer Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingInput
            label="Focus Duration"
            value={settings.focusTime}
            unit="min"
            min={5}
            max={60}
            step={5}
            onChange={(v) => updateSetting("focusTime", v)}
          />
          <SettingInput
            label="Short Break"
            value={settings.shortBreakTime}
            unit="min"
            min={1}
            max={15}
            step={1}
            onChange={(v) => updateSetting("shortBreakTime", v)}
          />
          <SettingInput
            label="Long Break"
            value={settings.longBreakTime}
            unit="min"
            min={10}
            max={30}
            step={5}
            onChange={(v) => updateSetting("longBreakTime", v)}
          />
        </div>
        <div className="mt-4 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between">
            <span>Long break after</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() =>
                  updateSetting(
                    "longBreakAfter",
                    Math.max(2, settings.longBreakAfter - 1),
                  )
                }
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-semibold">
                {settings.longBreakAfter}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() =>
                  updateSetting(
                    "longBreakAfter",
                    Math.min(8, settings.longBreakAfter + 1),
                  )
                }
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-muted-foreground">sessions</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Auto-Start Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Automation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium">Auto-start breaks</p>
              <p className="text-sm text-muted-foreground">
                Automatically start break after focus session
              </p>
            </div>
            <Switch
              checked={settings.autoStartBreak}
              onCheckedChange={(checked) =>
                updateSetting("autoStartBreak", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium">Auto-start focus</p>
              <p className="text-sm text-muted-foreground">
                Automatically start focus after break
              </p>
            </div>
            <Switch
              checked={settings.autoStartNextSession}
              onCheckedChange={(checked) =>
                updateSetting("autoStartNextSession", checked)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium">Sound notifications</p>
              <p className="text-sm text-muted-foreground">
                Play sound when timer ends
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                updateSetting("soundEnabled", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium">Browser notifications</p>
              <p className="text-sm text-muted-foreground">
                Show desktop notifications
              </p>
            </div>
            <Switch
              checked={settings.notificationEnabled}
              onCheckedChange={(checked) =>
                updateSetting("notificationEnabled", checked)
              }
            />
          </div>
          {settings.soundEnabled && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Volume</span>
                <span className="text-muted-foreground">{volume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={(val) => setVolume(val[0])}
                  max={100}
                  step={10}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SettingInputProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SettingInput({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: SettingInputProps) {
  return (
    <div className="p-4 bg-muted/50 rounded-xl">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-muted-foreground">{unit}</span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Slider
          value={[value]}
          onValueChange={(val) => onChange(val[0])}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

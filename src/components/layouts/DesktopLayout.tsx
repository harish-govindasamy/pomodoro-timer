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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DesktopLayout() {
  const { loadTasks } = useTaskStore();
  const { settings, loadSettings, updateSetting } = useSettingsStore();
  const { loadStats, today } = useStatsStore();
  const { theme, setTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<
    "tasks" | "stats" | "settings"
  >("tasks");

  useEffect(() => {
    loadTasks();
    loadSettings();
    loadStats();
  }, [loadTasks, loadSettings, loadStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Pomodoro Focus</h1>
              <p className="text-xs text-muted-foreground">
                Stay focused, achieve more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span>{today.pomodorosCompleted} sessions today</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>{today.totalFocusTimeMinutes}m focused</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
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

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Growth Mindset Academy. Built with{" "}
              <Heart className="w-3 h-3 inline text-red-500" /> for focused
              minds.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
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
                    Math.max(2, settings.longBreakAfter - 1)
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
                    Math.min(8, settings.longBreakAfter + 1)
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

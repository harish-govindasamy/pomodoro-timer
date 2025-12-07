"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Volume2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

interface SettingsPageProps {
  onBack?: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSetting } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const [volume, setVolume] = useState(80);

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

        {/* General Section */}
        <div className="p-4 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            General
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-between h-12">
              <span>Rate App</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between h-12">
              <span>Send Feedback</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Harish Govindasamy</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
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

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Timer,
  CheckCircle2,
  Flame,
  Settings,
  Moon,
  Sun,
  Monitor,
  X,
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useSettings } from "@/hooks/useSettings";

export function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalPomodoros, totalFocusTime, totalTasksCompleted, streak } =
    useStats();
  const {
    settings,
    updateTheme,
    updateFocusTime,
    updateShortBreakTime,
    updateLongBreakTime,
    updateLongBreakAfter,
    toggleAutoStartNextSession,
    toggleAutoStartBreak,
    toggleSound,
    toggleNotifications,
    updateAlarmSound,
    resetSettings,
  } = useSettings();

  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentTheme = theme || "light";
    const currentIndex = themes.indexOf(
      currentTheme as "light" | "dark" | "system"
    );
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
    updateTheme(nextTheme === "system" ? "auto" : nextTheme);
  };

  const getCurrentThemeIcon = () => {
    if (!mounted) return <Sun className="w-4 h-4" />;
    if (resolvedTheme === "dark") return <Moon className="w-4 h-4" />;
    if (theme === "system") return <Monitor className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">Pomofocus</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">{totalPomodoros} pomodoros</Badge>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">{totalTasksCompleted} tasks</Badge>
              </div>

              {streak > 0 && (
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-500">
                    {streak} day streak
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {getCurrentThemeIcon()}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="md:hidden mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline">{totalPomodoros}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline">{totalTasksCompleted} tasks</Badge>
            </div>

            {streak > 0 && (
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <Badge variant="outline" className="text-orange-500">
                  {streak}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {showSettings && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Timer Settings */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-lg">Timer Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="focus-time">Focus Time (minutes)</Label>
                    <Input
                      id="focus-time"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.focusTime}
                      onChange={(e) =>
                        updateFocusTime(parseInt(e.target.value))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="short-break">Short Break (minutes)</Label>
                    <Input
                      id="short-break"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakTime}
                      onChange={(e) =>
                        updateShortBreakTime(parseInt(e.target.value))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="long-break">Long Break (minutes)</Label>
                    <Input
                      id="long-break"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakTime}
                      onChange={(e) =>
                        updateLongBreakTime(parseInt(e.target.value))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="long-break-after">
                      Long Break After (pomodoros)
                    </Label>
                    <Input
                      id="long-break-after"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.longBreakAfter}
                      onChange={(e) =>
                        updateLongBreakAfter(parseInt(e.target.value))
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Automation Settings */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-lg">Automation</h3>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-start-session">
                    Auto-start next session
                  </Label>
                  <Switch
                    id="auto-start-session"
                    checked={settings.autoStartNextSession}
                    onCheckedChange={toggleAutoStartNextSession}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-start-break">Auto-start break</Label>
                  <Switch
                    id="auto-start-break"
                    checked={settings.autoStartBreak}
                    onCheckedChange={toggleAutoStartBreak}
                  />
                </div>
              </div>

              {/* Sound & Notification Settings */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-lg">Sound & Notifications</h3>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled">Enable Sound</Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={toggleSound}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-enabled">
                    Enable Notifications
                  </Label>
                  <Switch
                    id="notifications-enabled"
                    checked={settings.notificationEnabled}
                    onCheckedChange={toggleNotifications}
                  />
                </div>

                {settings.soundEnabled && (
                  <div>
                    <Label htmlFor="alarm-sound">Alarm Sound</Label>
                    <Select
                      value={settings.alarmSound}
                      onValueChange={updateAlarmSound}
                    >
                      <SelectTrigger id="alarm-sound" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bell">Bell</SelectItem>
                        <SelectItem value="beep">Beep</SelectItem>
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="ding">Ding</SelectItem>
                        <SelectItem value="notification">
                          Notification
                        </SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="silence">Silence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Theme Settings */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-lg">Theme</h3>

                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => {
                      setTheme("light");
                      updateTheme("light");
                    }}
                    className="flex-1"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>

                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => {
                      setTheme("dark");
                      updateTheme("dark");
                    }}
                    className="flex-1"
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>

                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => {
                      setTheme("system");
                      updateTheme("auto");
                    }}
                    className="flex-1"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Auto
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={resetSettings}
                  className="flex-1"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

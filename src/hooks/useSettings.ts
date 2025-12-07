import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/store/settingsStore";
import { Settings } from "@/types";

export function useSettings() {
  const {
    settings,
    loadSettings,
    updateSetting,
    updateSettings,
    resetToDefaults,
  } = useSettingsStore();

  const { setTheme } = useTheme();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync theme with next-themes whenever settings.theme changes
  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme === "auto" ? "system" : settings.theme);
    }
  }, [settings.theme, setTheme]);

  const updateTimerSetting = (key: keyof Settings, value: any) => {
    updateSetting(key, value);
  };

  const updateFocusTime = (minutes: number) => {
    if (minutes >= 1 && minutes <= 60) {
      updateSetting("focusTime", minutes);
    }
  };

  const updateShortBreakTime = (minutes: number) => {
    if (minutes >= 1 && minutes <= 30) {
      updateSetting("shortBreakTime", minutes);
    }
  };

  const updateLongBreakTime = (minutes: number) => {
    if (minutes >= 1 && minutes <= 60) {
      updateSetting("longBreakTime", minutes);
    }
  };

  const updateLongBreakAfter = (count: number) => {
    if (count >= 1 && count <= 10) {
      updateSetting("longBreakAfter", count);
    }
  };

  const toggleAutoStartNextSession = () => {
    updateSetting("autoStartNextSession", !settings.autoStartNextSession);
  };

  const toggleAutoStartBreak = () => {
    updateSetting("autoStartBreak", !settings.autoStartBreak);
  };

  const updateNotificationAdvanceTime = (seconds: number) => {
    if ([0, 30, 60].includes(seconds)) {
      updateSetting("notificationAdvanceTime", seconds);
    }
  };

  const updateAlarmSound = (sound: string) => {
    updateSetting("alarmSound", sound);
  };

  const toggleSound = () => {
    updateSetting("soundEnabled", !settings.soundEnabled);
  };

  const toggleNotifications = () => {
    updateSetting("notificationEnabled", !settings.notificationEnabled);
  };

  const updateTheme = (theme: "light" | "dark" | "auto") => {
    updateSetting("theme", theme);
  };

  const resetSettings = () => {
    resetToDefaults();
  };

  return {
    // State
    settings,

    // Timer settings
    focusTime: settings.focusTime,
    shortBreakTime: settings.shortBreakTime,
    longBreakTime: settings.longBreakTime,
    longBreakAfter: settings.longBreakAfter,

    // Auto settings
    autoStartNextSession: settings.autoStartNextSession,
    autoStartBreak: settings.autoStartBreak,

    // Notification settings
    notificationAdvanceTime: settings.notificationAdvanceTime,
    alarmSound: settings.alarmSound,
    soundEnabled: settings.soundEnabled,
    notificationEnabled: settings.notificationEnabled,

    // Theme
    theme: settings.theme,

    // Actions
    updateSetting: updateTimerSetting,
    updateSettings,
    updateFocusTime,
    updateShortBreakTime,
    updateLongBreakTime,
    updateLongBreakAfter,
    toggleAutoStartNextSession,
    toggleAutoStartBreak,
    updateNotificationAdvanceTime,
    updateAlarmSound,
    toggleSound,
    toggleNotifications,
    updateTheme,
    resetSettings,
  };
}

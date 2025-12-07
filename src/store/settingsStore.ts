import { create } from 'zustand';
import { Settings } from '@/types';
import { loadSettings, saveSettings } from '@/utils/storage';

interface SettingsStore {
  settings: Settings;
  
  // Actions
  loadSettings: () => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Settings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakAfter: 4,
  autoStartNextSession: false,
  autoStartBreak: false,
  notificationAdvanceTime: 0,
  alarmSound: 'bell',
  soundEnabled: true,
  notificationEnabled: true,
  theme: 'light',
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,

  loadSettings: () => {
    try {
      const settings = loadSettings();
      set({ settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ settings: defaultSettings });
    }
  },

  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const { settings } = get();
    const updatedSettings = { ...settings, [key]: value };
    set({ settings: updatedSettings });
    try {
      saveSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  updateSettings: (updates: Partial<Settings>) => {
    const { settings } = get();
    const updatedSettings = { ...settings, ...updates };
    set({ settings: updatedSettings });
    try {
      saveSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  resetToDefaults: () => {
    set({ settings: defaultSettings });
    try {
      saveSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to save default settings:', error);
    }
  },
}));
import { create } from "zustand";
import { DailyStats } from "@/types";
import {
  loadTodayStats,
  saveTodayStats,
  loadHistory,
  saveHistory,
  getTodayDateString,
} from "@/utils/storage";

interface StatsStore {
  today: DailyStats;
  history: DailyStats[];

  // Actions
  loadStats: () => void;
  incrementPomodoro: () => void;
  updateFocusTime: (minutes: number) => void;
  incrementTaskCompletion: () => void;
  decrementTaskCompletion: () => void;
  addDayToHistory: () => void;
  getStatsForDate: (date: string) => DailyStats | null;
  getWeeklyStats: () => DailyStats[];
  getMonthlyStats: () => DailyStats[];
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  today: {
    date: getTodayDateString(),
    pomodorosCompleted: 0,
    totalFocusTimeMinutes: 0,
    tasksCompleted: 0,
  },
  history: [],

  loadStats: () => {
    try {
      const today = loadTodayStats();
      const history = loadHistory();
      set({ today, history });
    } catch (error) {
      console.error("Failed to load stats:", error);
      const defaultToday = {
        date: getTodayDateString(),
        pomodorosCompleted: 0,
        totalFocusTimeMinutes: 0,
        tasksCompleted: 0,
      };
      set({ today: defaultToday, history: [] });
    }
  },

  incrementPomodoro: () => {
    const { today } = get();
    const updatedToday = {
      ...today,
      pomodorosCompleted: today.pomodorosCompleted + 1,
    };
    set({ today: updatedToday });
    try {
      saveTodayStats(updatedToday);
    } catch (error) {
      console.error("Failed to save today stats:", error);
    }
  },

  updateFocusTime: (minutes: number) => {
    const { today } = get();
    const updatedToday = {
      ...today,
      totalFocusTimeMinutes: today.totalFocusTimeMinutes + minutes,
    };
    set({ today: updatedToday });
    try {
      saveTodayStats(updatedToday);
    } catch (error) {
      console.error("Failed to save today stats:", error);
    }
  },

  incrementTaskCompletion: () => {
    const { today } = get();
    const updatedToday = {
      ...today,
      tasksCompleted: today.tasksCompleted + 1,
    };
    set({ today: updatedToday });
    try {
      saveTodayStats(updatedToday);
    } catch (error) {
      console.error("Failed to save today stats:", error);
    }
  },

  decrementTaskCompletion: () => {
    const { today } = get();
    const updatedToday = {
      ...today,
      tasksCompleted: Math.max(0, today.tasksCompleted - 1), // Don't go below 0
    };
    set({ today: updatedToday });
    try {
      saveTodayStats(updatedToday);
    } catch (error) {
      console.error("Failed to save today stats:", error);
    }
  },

  addDayToHistory: () => {
    const { today, history } = get();
    const todayString = getTodayDateString();

    // Only add to history if today's stats are not empty
    if (today.pomodorosCompleted > 0 || today.tasksCompleted > 0) {
      const updatedHistory = [today, ...history].slice(0, 30); // Keep last 30 days
      set({ history: updatedHistory });
      try {
        saveHistory(updatedHistory);
      } catch (error) {
        console.error("Failed to save history:", error);
      }

      // Reset today's stats
      const newToday = {
        date: todayString,
        pomodorosCompleted: 0,
        totalFocusTimeMinutes: 0,
        tasksCompleted: 0,
      };
      set({ today: newToday });
      try {
        saveTodayStats(newToday);
      } catch (error) {
        console.error("Failed to save today stats:", error);
      }
    }
  },

  getStatsForDate: (date: string) => {
    const { today, history } = get();
    if (today.date === date) return today;
    return history.find((day) => day.date === date) || null;
  },

  getWeeklyStats: () => {
    const { today, history } = get();
    const allStats = [today, ...history];

    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days from Monday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    return allStats.filter((stat) => {
      const statDate = new Date(stat.date + "T00:00:00");
      statDate.setHours(0, 0, 0, 0);
      return statDate >= startOfWeek;
    });
  },

  getMonthlyStats: () => {
    const { today, history } = get();
    const allStats = [today, ...history];

    // Get start of this month (1st day of current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    return allStats.filter((stat) => {
      const statDate = new Date(stat.date + "T00:00:00");
      statDate.setHours(0, 0, 0, 0);
      return statDate >= startOfMonth;
    });
  },
}));

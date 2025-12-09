import { Task, Settings, DailyStats, TimerMode } from "@/types";

const STORAGE_KEYS = {
  TASKS: "pomofocus_tasks",
  SETTINGS: "pomofocus_settings",
  TODAY: "pomofocus_today",
  HISTORY: "pomofocus_history",
  TIMER_STATE: "pomofocus_timer_state",
} as const;

// Timer state for persistence across page reloads
export interface PersistedTimerState {
  mode: TimerMode;
  pomodorosCompleted: number;
  selectedTaskId: string | null;
  // For running timer recovery
  wasRunning: boolean;
  startedAt: number | null; // Timestamp when timer was started
  initialDuration: number; // Duration in seconds when timer started
  savedAt: number; // Timestamp when state was saved
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function loadTasks(): Task[] {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks:", error);
  }
}

export function loadSettings(): Settings {
  const defaultSettings: Settings = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakAfter: 4,
    autoStartNextSession: false,
    autoStartBreak: false,
    notificationAdvanceTime: 0,
    alarmSound: "bell",
    soundEnabled: true,
    notificationEnabled: true,
    theme: "light",
  };

  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return defaultSettings;

    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored
      ? { ...defaultSettings, ...JSON.parse(stored) }
      : defaultSettings;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function loadTodayStats(): DailyStats {
  const defaultStats: DailyStats = {
    date: getTodayDateString(),
    pomodorosCompleted: 0,
    totalFocusTimeMinutes: 0,
    tasksCompleted: 0,
  };

  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return defaultStats;

    const stored = localStorage.getItem(STORAGE_KEYS.TODAY);
    const stats = stored ? JSON.parse(stored) : defaultStats;

    // If it's a new day, save yesterday's stats to history first
    if (stats.date !== defaultStats.date) {
      // Only add to history if yesterday had activity
      if (
        stats.pomodorosCompleted > 0 ||
        stats.tasksCompleted > 0 ||
        stats.totalFocusTimeMinutes > 0
      ) {
        const history = loadHistory();
        // Avoid duplicates - check if this date already exists in history
        const existingIndex = history.findIndex((h) => h.date === stats.date);
        if (existingIndex === -1) {
          const updatedHistory = [stats, ...history].slice(0, 30); // Keep last 30 days
          saveHistory(updatedHistory);
        }
      }
      // Now reset to today's empty stats
      saveTodayStats(defaultStats);
      return defaultStats;
    }

    return stats;
  } catch (error) {
    console.error("Failed to load today stats:", error);
    return defaultStats;
  }
}

export function saveTodayStats(stats: DailyStats): void {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.TODAY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save today stats:", error);
  }
}

export function loadHistory(): DailyStats[] {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

export function saveHistory(history: DailyStats[]): void {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

export function clearAllData(): void {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return;

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

export function exportData() {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") return;

    const data = {
      tasks: loadTasks(),
      settings: loadSettings(),
      today: loadTodayStats(),
      history: loadHistory(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pomofocus-backup-${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export data:", error);
  }
}

// Timer State Persistence Functions
export function saveTimerState(state: PersistedTimerState): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEYS.TIMER_STATE,
      JSON.stringify({
        ...state,
        savedAt: Date.now(),
      }),
    );
  } catch (error) {
    console.error("Failed to save timer state:", error);
  }
}

export function loadTimerState(): PersistedTimerState | null {
  try {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (!stored) return null;

    const state: PersistedTimerState = JSON.parse(stored);

    // Check if the state is stale (older than 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - state.savedAt > maxAge) {
      clearTimerState();
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to load timer state:", error);
    return null;
  }
}

export function clearTimerState(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  } catch (error) {
    console.error("Failed to clear timer state:", error);
  }
}

// Calculate remaining time for a running timer after page reload
export function calculateRemainingTime(state: PersistedTimerState): number {
  if (!state.wasRunning || !state.startedAt) {
    return state.initialDuration;
  }

  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  const remaining = state.initialDuration - elapsed;

  return Math.max(0, remaining);
}

export function importData(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Only access localStorage on client side
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (data.tasks) saveTasks(data.tasks);
          if (data.settings) saveSettings(data.settings);
          if (data.today) saveTodayStats(data.today);
          if (data.history) saveHistory(data.history);

          resolve(true);
        } catch (error) {
          console.error("Failed to parse imported data:", error);
          resolve(false);
        }
      };

      reader.onerror = () => {
        console.error("Failed to read file");
        resolve(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Failed to import data:", error);
      resolve(false);
    }
  });
}

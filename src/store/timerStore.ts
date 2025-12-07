import { create } from "zustand";
import { TimerMode, TimerState, TimerData } from "@/types";
import { loadSettings } from "@/utils/storage";

interface TimerStore extends TimerData {
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  tick: () => void;
  completeSession: () => void;
  getDuration: () => number;
  refreshDuration: () => void; // Refresh timer when settings change
  // Internal
  intervalId: NodeJS.Timeout | null;
  startedAt: number | null; // Timestamp when timer started
  pausedTimeRemaining: number | null; // Time remaining when paused
}

const getInitialDuration = (mode: TimerMode): number => {
  try {
    // Only access localStorage on client side
    if (typeof window === "undefined") {
      const defaultDurations = {
        focus: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
      };
      return defaultDurations[mode] || 25 * 60;
    }

    const settings = loadSettings();
    switch (mode) {
      case "focus":
        return settings.focusTime * 60;
      case "shortBreak":
        return settings.shortBreakTime * 60;
      case "longBreak":
        return settings.longBreakTime * 60;
      default:
        return 25 * 60;
    }
  } catch {
    return 25 * 60;
  }
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  currentTime: getInitialDuration("focus"),
  isRunning: false,
  mode: "focus",
  state: "idle",
  pomodorosCompleted: 0,
  selectedTaskId: null,
  intervalId: null,
  lastCompletedMode: null,
  startedAt: null,
  pausedTimeRemaining: null,

  // Actions
  startTimer: () => {
    const { intervalId, currentTime } = get();

    // Clear any existing interval first
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Record the start timestamp and duration
    const now = Date.now();
    const duration = currentTime; // seconds remaining

    // Create a new interval - using timestamp-based calculation
    const newIntervalId = setInterval(() => {
      get().tick();
    }, 250); // Check more frequently for better accuracy

    set({
      isRunning: true,
      state: "running",
      intervalId: newIntervalId,
      startedAt: now,
      pausedTimeRemaining: duration,
    });
  },

  pauseTimer: () => {
    const { intervalId, currentTime } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({
      isRunning: false,
      state: "paused",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: currentTime, // Save current time for resume
    });
  },

  resetTimer: () => {
    const { mode, intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({
      currentTime: getInitialDuration(mode),
      isRunning: false,
      state: "idle",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: null,
    });
  },

  skipTimer: () => {
    const { mode, pomodorosCompleted, intervalId } = get();

    // Clear interval when skipping
    if (intervalId) {
      clearInterval(intervalId);
    }

    let nextMode: TimerMode;

    if (mode === "focus") {
      try {
        const settings = loadSettings();
        const shouldTakeLongBreak =
          (pomodorosCompleted + 1) % settings.longBreakAfter === 0;
        nextMode = shouldTakeLongBreak ? "longBreak" : "shortBreak";
      } catch {
        nextMode = "shortBreak";
      }
    } else {
      nextMode = "focus";
    }

    set({
      mode: nextMode,
      currentTime: getInitialDuration(nextMode),
      isRunning: false,
      state: "idle",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: null,
    });
  },

  setMode: (mode: TimerMode) => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({
      mode,
      currentTime: getInitialDuration(mode),
      isRunning: false,
      state: "idle",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: null,
    });
  },

  setSelectedTaskId: (taskId: string | null) => {
    set({ selectedTaskId: taskId });
  },

  tick: () => {
    const { isRunning, startedAt, pausedTimeRemaining } = get();

    if (!isRunning || !startedAt || pausedTimeRemaining === null) return;

    // Calculate remaining time based on timestamps (more accurate for background)
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startedAt) / 1000);
    const newTime = Math.max(0, pausedTimeRemaining - elapsedSeconds);

    if (newTime > 0) {
      set({ currentTime: newTime });
    } else if (newTime === 0) {
      set({ currentTime: 0 });
      get().completeSession();
    }
  },

  completeSession: () => {
    const { mode, pomodorosCompleted, intervalId } = get();

    // Clear interval when session completes
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Store the current mode before changing it - this is the mode that just completed
    const completedMode = mode;

    let newPomodorosCompleted = pomodorosCompleted;
    let nextMode: TimerMode;

    if (mode === "focus") {
      newPomodorosCompleted = pomodorosCompleted + 1;
      try {
        const settings = loadSettings();
        const shouldTakeLongBreak =
          newPomodorosCompleted % settings.longBreakAfter === 0;
        nextMode = shouldTakeLongBreak ? "longBreak" : "shortBreak";
      } catch {
        nextMode = "shortBreak";
      }
    } else {
      nextMode = "focus";
    }

    set({
      pomodorosCompleted: newPomodorosCompleted,
      mode: nextMode,
      currentTime: getInitialDuration(nextMode),
      isRunning: false,
      state: "completed",
      intervalId: null,
      lastCompletedMode: completedMode,
      startedAt: null,
      pausedTimeRemaining: null,
    });
  },

  refreshDuration: () => {
    const { mode, state, isRunning } = get();
    // Only update if timer is not running (idle or paused)
    if (!isRunning && state === "idle") {
      set({ currentTime: getInitialDuration(mode) });
    }
  },

  getDuration: () => {
    const { mode } = get();
    return getInitialDuration(mode);
  },
}));

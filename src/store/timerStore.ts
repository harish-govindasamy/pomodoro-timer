import { create } from "zustand";
import { TimerMode, TimerState, TimerData } from "@/types";
import {
  loadSettings,
  saveTimerState,
  loadTimerState,
  clearTimerState,
  calculateRemainingTime,
} from "@/utils/storage";

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

// Debounce helper to avoid excessive localStorage writes
let saveTimeout: NodeJS.Timeout | null = null;
const debouncedSaveTimerState = (
  state: Parameters<typeof saveTimerState>[0],
) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimerState(state);
  }, 1000); // Save at most once per second
};

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

// Get initial state from localStorage if available
const getInitialState = () => {
  const persistedState = loadTimerState();

  if (persistedState) {
    const remainingTime = calculateRemainingTime(persistedState);

    // If timer was running and there's still time left
    if (persistedState.wasRunning && remainingTime > 0) {
      return {
        currentTime: remainingTime,
        mode: persistedState.mode,
        pomodorosCompleted: persistedState.pomodorosCompleted,
        selectedTaskId: persistedState.selectedTaskId,
        // Don't auto-resume, but show paused state
        isRunning: false,
        state: "paused" as TimerState,
        startedAt: null,
        pausedTimeRemaining: remainingTime,
      };
    }

    // Timer wasn't running or time expired
    return {
      currentTime: getInitialDuration(persistedState.mode),
      mode: persistedState.mode,
      pomodorosCompleted: persistedState.pomodorosCompleted,
      selectedTaskId: persistedState.selectedTaskId,
      isRunning: false,
      state: "idle" as TimerState,
      startedAt: null,
      pausedTimeRemaining: null,
    };
  }

  return {
    currentTime: getInitialDuration("focus"),
    mode: "focus" as TimerMode,
    pomodorosCompleted: 0,
    selectedTaskId: null,
    isRunning: false,
    state: "idle" as TimerState,
    startedAt: null,
    pausedTimeRemaining: null,
  };
};

const initialState = getInitialState();

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state (recovered from localStorage if available)
  currentTime: initialState.currentTime,
  isRunning: initialState.isRunning,
  mode: initialState.mode,
  state: initialState.state,
  pomodorosCompleted: initialState.pomodorosCompleted,
  selectedTaskId: initialState.selectedTaskId,
  intervalId: null,
  lastCompletedMode: null,
  startedAt: initialState.startedAt,
  pausedTimeRemaining: initialState.pausedTimeRemaining,

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

    // Persist timer state
    const { mode, pomodorosCompleted, selectedTaskId } = get();
    saveTimerState({
      mode,
      pomodorosCompleted,
      selectedTaskId,
      wasRunning: true,
      startedAt: now,
      initialDuration: duration,
      savedAt: Date.now(),
    });
  },

  pauseTimer: () => {
    const {
      intervalId,
      currentTime,
      mode,
      pomodorosCompleted,
      selectedTaskId,
    } = get();
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

    // Persist paused state
    saveTimerState({
      mode,
      pomodorosCompleted,
      selectedTaskId,
      wasRunning: false,
      startedAt: null,
      initialDuration: currentTime,
      savedAt: Date.now(),
    });
  },

  resetTimer: () => {
    const { mode, intervalId, pomodorosCompleted, selectedTaskId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    const newDuration = getInitialDuration(mode);
    set({
      currentTime: newDuration,
      isRunning: false,
      state: "idle",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: null,
    });

    // Persist reset state
    saveTimerState({
      mode,
      pomodorosCompleted,
      selectedTaskId,
      wasRunning: false,
      startedAt: null,
      initialDuration: newDuration,
      savedAt: Date.now(),
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

    const newDuration = getInitialDuration(nextMode);
    set({
      mode: nextMode,
      currentTime: newDuration,
      isRunning: false,
      state: "idle",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: null,
    });

    // Persist skipped state
    saveTimerState({
      mode: nextMode,
      pomodorosCompleted,
      selectedTaskId: get().selectedTaskId,
      wasRunning: false,
      startedAt: null,
      initialDuration: newDuration,
      savedAt: Date.now(),
    });
  },

  setMode: (mode: TimerMode) => {
    const { intervalId, pomodorosCompleted, selectedTaskId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    const newDuration = getInitialDuration(mode);
    set({
      mode,
      currentTime: newDuration,
      isRunning: false,
      state: "idle",
      intervalId: null,
      startedAt: null,
      pausedTimeRemaining: null,
    });

    // Persist mode change
    saveTimerState({
      mode,
      pomodorosCompleted,
      selectedTaskId,
      wasRunning: false,
      startedAt: null,
      initialDuration: newDuration,
      savedAt: Date.now(),
    });
  },

  setSelectedTaskId: (taskId: string | null) => {
    set({ selectedTaskId: taskId });

    // Persist task selection
    const { mode, pomodorosCompleted, currentTime, isRunning, startedAt } =
      get();
    debouncedSaveTimerState({
      mode,
      pomodorosCompleted,
      selectedTaskId: taskId,
      wasRunning: isRunning,
      startedAt,
      initialDuration: currentTime,
      savedAt: Date.now(),
    });
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

    const newDuration = getInitialDuration(nextMode);
    set({
      pomodorosCompleted: newPomodorosCompleted,
      mode: nextMode,
      currentTime: newDuration,
      isRunning: false,
      state: "completed",
      intervalId: null,
      lastCompletedMode: completedMode,
      startedAt: null,
      pausedTimeRemaining: null,
    });

    // Persist completed session state
    saveTimerState({
      mode: nextMode,
      pomodorosCompleted: newPomodorosCompleted,
      selectedTaskId: get().selectedTaskId,
      wasRunning: false,
      startedAt: null,
      initialDuration: newDuration,
      savedAt: Date.now(),
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

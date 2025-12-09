import { useEffect, useCallback, useRef } from "react";
import { useTimerStore } from "@/store/timerStore";
import { useTaskStore } from "@/store/taskStore";
import { useStatsStore } from "@/store/statsStore";
import { useSettingsStore } from "@/store/settingsStore";
import {
  formatTime,
  playSound,
  showNotification,
  updateBrowserTitle,
  resetBrowserTitle,
  requestNotificationPermission,
} from "@/utils";

export function useTimer() {
  const {
    currentTime,
    isRunning,
    mode,
    state,
    pomodorosCompleted,
    selectedTaskId,
    lastCompletedMode,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setMode,
    setSelectedTaskId,
    tick,
    completeSession,
    getDuration,
  } = useTimerStore();

  const { incrementTaskPomodoro, getSelectedTask } = useTaskStore();
  const { incrementPomodoro, updateFocusTime } = useStatsStore();
  const { settings } = useSettingsStore();

  // Request notification permission on mount
  useEffect(() => {
    if (settings.notificationEnabled) {
      requestNotificationPermission();
    }
  }, [settings.notificationEnabled]);

  const handleTimerComplete = useCallback(() => {
    // Use lastCompletedMode to determine what just completed (not current mode which is already changed)
    const completedMode = lastCompletedMode;
    const wasFocusSession = completedMode === "focus";

    // Play sound
    if (settings.soundEnabled) {
      playSound(settings.alarmSound);
    }

    // Show notification
    if (settings.notificationEnabled) {
      const title = wasFocusSession ? "Time for a break!" : "Time to focus!";
      const body = wasFocusSession
        ? "Great job! Take a well-deserved break to recharge."
        : "Break is over! Let's get back to focus mode.";

      showNotification(title, body);
    }

    // Handle focus session completion
    if (wasFocusSession) {
      // Update stats
      incrementPomodoro();
      updateFocusTime(settings.focusTime);

      // Update selected task
      if (selectedTaskId) {
        incrementTaskPomodoro(selectedTaskId);
      }
    }

    // Auto-start next session if enabled
    if (settings.autoStartNextSession) {
      setTimeout(() => {
        startTimer();
      }, 2000);
    }
  }, [
    settings.soundEnabled,
    settings.alarmSound,
    settings.notificationEnabled,
    lastCompletedMode,
    selectedTaskId,
    incrementPomodoro,
    updateFocusTime,
    incrementTaskPomodoro,
    startTimer,
    settings.autoStartNextSession,
    settings.focusTime,
  ]);

  // Track if completion has been handled to prevent multiple calls
  const completionHandledRef = useRef(false);

  // Reset the flag when state changes from completed to something else
  useEffect(() => {
    if (state !== "completed") {
      completionHandledRef.current = false;
    }
  }, [state]);

  // Handle timer completion
  useEffect(() => {
    if (state === "completed" && !completionHandledRef.current) {
      completionHandledRef.current = true;
      handleTimerComplete();
    }
  }, [state, handleTimerComplete]);

  // Update browser title
  useEffect(() => {
    if (isRunning || state === "paused") {
      updateBrowserTitle(currentTime, mode);
    } else {
      resetBrowserTitle();
    }

    return () => {
      resetBrowserTitle();
    };
  }, [currentTime, mode, isRunning, state]);

  const formatDisplayTime = useCallback(() => {
    return formatTime(currentTime);
  }, [currentTime]);

  const getProgress = useCallback(() => {
    const duration = getDuration();
    if (duration <= 0) return 0;
    const elapsed = duration - currentTime;
    return Math.min((elapsed / duration) * 100, 100);
  }, [currentTime, getDuration]);

  const getModeLabel = useCallback(() => {
    switch (mode) {
      case "focus":
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus";
    }
  }, [mode]);

  const getModeColor = useCallback(() => {
    switch (mode) {
      case "focus":
        return "text-red-500";
      case "shortBreak":
        return "text-blue-500";
      case "longBreak":
        return "text-green-500";
      default:
        return "text-red-500";
    }
  }, [mode]);

  return {
    // State
    currentTime,
    isRunning,
    mode,
    state,
    pomodorosCompleted,
    selectedTaskId,
    selectedTask: getSelectedTask(),

    // Computed
    displayTime: formatDisplayTime(),
    progress: getProgress(),
    modeLabel: getModeLabel(),
    modeColor: getModeColor(),

    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setMode,
    setSelectedTaskId,
  };
}

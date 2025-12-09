"use client";

import { useEffect, useState, useCallback } from "react";
import { useTimer } from "@/hooks/useTimer";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Target,
  Coffee,
  Moon,
} from "lucide-react";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  mode?: "focus" | "shortBreak" | "longBreak";
  children?: React.ReactNode;
}

function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 12,
  mode = "focus",
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const gradientColors = {
    focus: { start: "#EF4444", end: "#F97316" },
    shortBreak: { start: "#3B82F6", end: "#06B6D4" },
    longBreak: { start: "#10B981", end: "#34D399" },
  };

  const colors = gradientColors[mode];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${mode})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.3s ease",
          }}
        />
        <defs>
          <linearGradient
            id={`gradient-${mode}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface EnhancedTimerDisplayProps {
  size?: "small" | "medium" | "large";
  showTaskCard?: boolean;
  className?: string;
}

export function EnhancedTimerDisplay({
  size = "medium",
  showTaskCard = true,
  className = "",
}: EnhancedTimerDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const { settings } = useSettingsStore();
  const {
    displayTime,
    progress,
    selectedTask,
    isRunning,
    mode,
    state,
    pomodorosCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setMode,
  } = useTimer();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcuts handler (Desktop only)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      } else if (event.code === "KeyR") {
        event.preventDefault();
        resetTimer();
      } else if (event.code === "KeyS") {
        event.preventDefault();
        skipTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, startTimer, pauseTimer, resetTimer, skipTimer]);

  const sizeConfig = {
    small: {
      timer: 200,
      font: "text-4xl",
      controls: "w-10 h-10",
      play: "w-12 h-12",
    },
    medium: {
      timer: 280,
      font: "text-6xl",
      controls: "w-12 h-12",
      play: "w-16 h-16",
    },
    large: {
      timer: 340,
      font: "text-7xl",
      controls: "w-14 h-14",
      play: "w-20 h-20",
    },
  };

  const config = sizeConfig[size];

  const getModeInfo = useCallback(() => {
    switch (mode) {
      case "focus":
        return {
          label: "Focus Session",
          color: "bg-red-500 hover:bg-red-600",
          icon: Target,
          remaining: Math.ceil(
            (settings.focusTime * 60 -
              (settings.focusTime * 60 * progress) / 100) /
              60
          ),
        };
      case "shortBreak":
        return {
          label: "Short Break",
          color: "bg-blue-500 hover:bg-blue-600",
          icon: Coffee,
          remaining: Math.ceil(
            (settings.shortBreakTime * 60 -
              (settings.shortBreakTime * 60 * progress) / 100) /
              60
          ),
        };
      case "longBreak":
        return {
          label: "Long Break",
          color: "bg-green-500 hover:bg-green-600",
          icon: Moon,
          remaining: Math.ceil(
            (settings.longBreakTime * 60 -
              (settings.longBreakTime * 60 * progress) / 100) /
              60
          ),
        };
      default:
        return {
          label: "Focus",
          color: "bg-red-500",
          icon: Target,
          remaining: 25,
        };
    }
  }, [mode, progress, settings]);

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  if (!mounted) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-8 ${className}`}
      >
        <CircularProgress progress={0} size={config.timer} mode="focus">
          <div
            className={`${config.font} font-bold text-foreground tabular-nums`}
          >
            25:00
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            0 of {settings.longBreakAfter} until long break
          </div>
        </CircularProgress>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Current Task Card */}
      {showTaskCard && selectedTask && (
        <div className="w-full max-w-sm mb-6 p-4 bg-card rounded-2xl border border-border flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {selectedTask.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedTask.estimatedPomodoros * settings.focusTime} mins total
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">
              {selectedTask.completedPomodoros}/
              {selectedTask.estimatedPomodoros}
            </p>
            <p className="text-sm text-muted-foreground">
              {(selectedTask.estimatedPomodoros -
                selectedTask.completedPomodoros) *
                settings.focusTime}{" "}
              mins left
            </p>
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex gap-2 mb-6">
        {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => setMode(m)}
            disabled={isRunning}
            className={`rounded-full px-4 ${mode === m ? modeInfo.color : ""}`}
          >
            {m === "focus" && <Target className="w-4 h-4 mr-1" />}
            {m === "shortBreak" && <Coffee className="w-4 h-4 mr-1" />}
            {m === "longBreak" && <Moon className="w-4 h-4 mr-1" />}
            {m === "focus" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
          </Button>
        ))}
      </div>

      {/* Circular Timer */}
      <CircularProgress progress={progress} size={config.timer} mode={mode}>
        <div
          className={`${config.font} font-bold text-foreground tabular-nums tracking-tight`}
        >
          {displayTime}
        </div>
        {selectedTask ? (
          <div className="text-sm text-muted-foreground mt-2 text-center">
            <div className="font-medium text-primary flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              {selectedTask.completedPomodoros}/
              {selectedTask.estimatedPomodoros} pomodoros
            </div>
            <div className="text-xs mt-1 flex items-center justify-center gap-1">
              <ModeIcon className="w-3 h-3" />
              {pomodorosCompleted % settings.longBreakAfter} of{" "}
              {settings.longBreakAfter} until long break
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <ModeIcon className="w-4 h-4" />
            {pomodorosCompleted % settings.longBreakAfter} of{" "}
            {settings.longBreakAfter} until long break
          </div>
        )}
      </CircularProgress>

      {/* Status Text */}
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-foreground">{modeInfo.label}</p>
        <p className="text-muted-foreground">
          {isRunning
            ? `${Math.max(0, modeInfo.remaining)} minutes remaining`
            : state === "paused"
            ? "Paused - tap to continue"
            : "Ready to start"}
        </p>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className={`${config.controls} rounded-full`}
          disabled={state === "idle" && !isRunning}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={isRunning ? pauseTimer : startTimer}
          size="lg"
          className={`${config.play} rounded-full ${modeInfo.color} text-white shadow-lg transition-transform hover:scale-105`}
        >
          {isRunning ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <Button
          onClick={skipTimer}
          variant="outline"
          size="icon"
          className={`${config.controls} rounded-full`}
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint (Desktop) */}
      <div className="hidden md:flex gap-4 mt-6 text-xs text-muted-foreground">
        <span>Space: Play/Pause</span>
        <span>R: Reset</span>
        <span>S: Skip</span>
      </div>
    </div>
  );
}

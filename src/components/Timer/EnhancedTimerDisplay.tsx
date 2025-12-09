"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  mode?: "focus" | "shortBreak" | "longBreak";
  isRunning?: boolean;
  children?: React.ReactNode;
}

function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 6,
  mode = "focus",
  isRunning = false,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const gradientColors = {
    focus: {
      start: "#EF4444",
      end: "#DC2626",
      bg: "rgba(239, 68, 68, 0.08)",
    },
    shortBreak: {
      start: "#3B82F6",
      end: "#2563EB",
      bg: "rgba(59, 130, 246, 0.08)",
    },
    longBreak: {
      start: "#10B981",
      end: "#059669",
      bg: "rgba(16, 185, 129, 0.08)",
    },
  };

  const colors = gradientColors[mode];
  const uniqueId = `gradient-${mode}-${size}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: colors.bg,
        }}
      />

      {/* SVG Progress Ring */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Track circle */}
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
          stroke={`url(#${uniqueId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
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
  const timerRef = useRef<HTMLDivElement>(null);
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

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [isRunning, startTimer, pauseTimer, resetTimer, skipTimer],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const sizeConfig = {
    small: {
      timer: 200,
      font: "text-4xl",
      subtext: "text-xs",
      controls: "w-10 h-10",
      play: "w-12 h-12",
      playIcon: "w-5 h-5",
      controlIcon: "w-4 h-4",
    },
    medium: {
      timer: 260,
      font: "text-5xl",
      subtext: "text-sm",
      controls: "w-11 h-11",
      play: "w-14 h-14",
      playIcon: "w-6 h-6",
      controlIcon: "w-4 h-4",
    },
    large: {
      timer: 320,
      font: "text-6xl",
      subtext: "text-sm",
      controls: "w-12 h-12",
      play: "w-16 h-16",
      playIcon: "w-7 h-7",
      controlIcon: "w-5 h-5",
    },
  };

  const config = sizeConfig[size];

  const getModeInfo = useCallback(() => {
    switch (mode) {
      case "focus":
        return {
          label: "Focus",
          color: "text-red-500",
          bgColor: "bg-red-500",
          icon: Target,
        };
      case "shortBreak":
        return {
          label: "Short Break",
          color: "text-blue-500",
          bgColor: "bg-blue-500",
          icon: Coffee,
        };
      case "longBreak":
        return {
          label: "Long Break",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500",
          icon: Moon,
        };
      default:
        return {
          label: "Focus",
          color: "text-red-500",
          bgColor: "bg-red-500",
          icon: Target,
        };
    }
  }, [mode]);

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  // Screen reader announcement
  const announceTimeForScreenReader = useCallback(
    (time: string) => {
      if (!mounted) return;
      const announcement = document.getElementById("timer-announcement");
      if (announcement) {
        announcement.textContent = `Timer: ${time}. ${modeInfo.label}. ${
          isRunning ? "Running" : state === "paused" ? "Paused" : "Ready"
        }`;
      }
    },
    [modeInfo.label, isRunning, state, mounted],
  );

  useEffect(() => {
    if (mounted && displayTime.endsWith(":00") && isRunning) {
      announceTimeForScreenReader(displayTime);
    }
  }, [displayTime, isRunning, announceTimeForScreenReader, mounted]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8",
          className,
        )}
      >
        <div className="relative">
          <div
            className="rounded-full bg-muted/20 animate-pulse"
            style={{ width: config.timer, height: config.timer }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(config.font, "font-bold text-muted-foreground/30")}
            >
              --:--
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      role="region"
      aria-label="Pomodoro Timer"
      ref={timerRef}
    >
      {/* Screen reader announcements */}
      <div
        id="timer-announcement"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Skip to controls link */}
      <a
        href="#timer-controls"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to timer controls
      </a>

      {/* Current Task Card - Minimal */}
      {showTaskCard && selectedTask && (
        <div className="w-full max-w-xs mb-6 animate-in fade-in duration-200">
          <div className="rounded-xl bg-muted/30 border border-border/30 p-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                  modeInfo.bgColor,
                )}
              >
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">
                  {selectedTask.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedTask.completedPomodoros}/
                  {selectedTask.estimatedPomodoros} pomodoros
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  modeInfo.bgColor,
                )}
                style={{
                  width: `${(selectedTask.completedPomodoros / selectedTask.estimatedPomodoros) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector Pills */}
      <div className="flex gap-1 mb-6 p-1 bg-muted/30 rounded-full">
        {(["focus", "shortBreak", "longBreak"] as const).map((m) => {
          const isActive = mode === m;
          const icons = {
            focus: Target,
            shortBreak: Coffee,
            longBreak: Moon,
          };
          const labels = {
            focus: "Focus",
            shortBreak: "Short",
            longBreak: "Long",
          };
          const Icon = icons[m];

          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              disabled={isRunning}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    mode === "focus" && "bg-red-500",
                    mode === "shortBreak" && "bg-blue-500",
                    mode === "longBreak" && "bg-emerald-500",
                  )}
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{labels[m]}</span>
            </button>
          );
        })}
      </div>

      {/* Timer Circle */}
      <div className="relative">
        <CircularProgress
          progress={progress}
          size={config.timer}
          mode={mode}
          isRunning={isRunning}
        >
          {/* Time Display */}
          <div className="text-center">
            <div
              className={cn(
                config.font,
                "font-bold tracking-tight tabular-nums text-foreground",
              )}
            >
              {displayTime}
            </div>

            {/* Session info */}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <ModeIcon className={cn("w-3.5 h-3.5", modeInfo.color)} />
              <span className={cn(config.subtext, "text-muted-foreground")}>
                {pomodorosCompleted % settings.longBreakAfter} of{" "}
                {settings.longBreakAfter}
              </span>
            </div>
          </div>
        </CircularProgress>
      </div>

      {/* Status */}
      <div className="mt-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isRunning
                ? "bg-green-500 animate-pulse"
                : state === "paused"
                  ? "bg-yellow-500"
                  : "bg-muted-foreground",
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isRunning ? "Running" : state === "paused" ? "Paused" : "Ready"}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div
        id="timer-controls"
        className="flex items-center justify-center gap-4 mt-6"
        role="group"
        aria-label="Timer controls"
      >
        {/* Reset Button */}
        <Button
          onClick={resetTimer}
          variant="ghost"
          size="icon"
          className={cn(
            config.controls,
            "rounded-full bg-muted/40 hover:bg-muted",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "disabled:opacity-30",
          )}
          disabled={state === "idle" && !isRunning}
          aria-label="Reset timer"
          title="Reset timer (R)"
        >
          <RotateCcw className={config.controlIcon} />
        </Button>

        {/* Play/Pause Button */}
        <Button
          onClick={isRunning ? pauseTimer : startTimer}
          size="lg"
          className={cn(
            config.play,
            "rounded-full shadow-md",
            modeInfo.bgColor,
            "hover:shadow-lg hover:scale-105 active:scale-95",
            "transition-all duration-200",
          )}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          title={isRunning ? "Pause timer (Space)" : "Start timer (Space)"}
        >
          {isRunning ? (
            <Pause className={cn(config.playIcon, "text-white")} />
          ) : (
            <Play className={cn(config.playIcon, "text-white ml-0.5")} />
          )}
        </Button>

        {/* Skip Button */}
        <Button
          onClick={skipTimer}
          variant="ghost"
          size="icon"
          className={cn(
            config.controls,
            "rounded-full bg-muted/40 hover:bg-muted",
            "transition-all duration-200 hover:scale-105 active:scale-95",
          )}
          aria-label="Skip to next session"
          title="Skip to next session (S)"
        >
          <SkipForward className={config.controlIcon} />
        </Button>
      </div>

      {/* Keyboard Shortcuts - Desktop */}
      <div className="hidden md:flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
        {[
          { key: "Space", action: "Play/Pause" },
          { key: "R", action: "Reset" },
          { key: "S", action: "Skip" },
        ].map(({ key, action }) => (
          <div key={key} className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
              {key}
            </kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 12,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F8EF7" />
            <stop offset="100%" stopColor="#6BA3FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function CircularTimerDisplay() {
  const [mounted, setMounted] = useState(false);
  const {
    displayTime,
    progress,
    selectedTask,
    isRunning,
    mode,
    pomodorosCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
  } = useTimer();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMotivationalText = () => {
    if (mode === "focus") {
      return `Stay focus for ${Math.ceil((100 - progress) * 0.25)} minutes`;
    } else if (mode === "shortBreak") {
      return "Take a short break";
    } else {
      return "Enjoy your long break";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "focus":
        return "Focus Session";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus";
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CircularProgress progress={0} size={280}>
          <div className="text-6xl font-bold text-foreground tabular-nums">
            25:00
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            0 of 4 until long break
          </div>
        </CircularProgress>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4">
      {/* Current Task Card */}
      {selectedTask && (
        <div className="w-full max-w-sm mb-6 p-4 bg-card rounded-2xl border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-mono text-sm">&lt;/&gt;</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {selectedTask.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedTask.estimatedPomodoros * 25} mins
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
                25}{" "}
              mins
            </p>
          </div>
        </div>
      )}

      {/* Circular Timer */}
      <CircularProgress progress={progress} size={280}>
        <div className="text-6xl font-bold text-foreground tabular-nums tracking-tight">
          {displayTime}
        </div>
        {selectedTask ? (
          <div className="text-sm text-muted-foreground mt-2 text-center">
            <div className="font-medium text-primary">
              {selectedTask.completedPomodoros}/{selectedTask.estimatedPomodoros} task pomodoros
            </div>
            <div className="text-xs mt-1">
              {pomodorosCompleted % 4} of 4 until long break
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mt-2">
            {pomodorosCompleted % 4} of 4 until long break
          </div>
        )}
      </CircularProgress>

      {/* Motivational Text */}
      <p className="text-muted-foreground mt-6 text-center">
        {getMotivationalText()}
      </p>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          onClick={resetTimer}
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={isRunning ? pauseTimer : startTimer}
          size="lg"
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          onClick={skipTimer}
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

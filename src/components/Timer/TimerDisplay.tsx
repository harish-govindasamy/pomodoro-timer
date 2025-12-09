"use client";

import { useEffect, useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw, Square } from "lucide-react";

export function TimerDisplay() {
  const [mounted, setMounted] = useState(false);
  const {
    displayTime,
    modeLabel,
    modeColor,
    progress,
    selectedTask,
    isRunning,
    state,
  } = useTimer();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="p-8 bg-background shadow-lg">
        <div className="text-center mb-8">
          <div className="text-7xl font-mono font-bold text-foreground tabular-nums">
            25:00
          </div>
        </div>
        <div className="mb-8">
          <Progress value={0} className="h-2" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-background shadow-lg">
      {/* Current Task Display */}
      {selectedTask && (
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">Current Task</p>
          <p className="text-lg font-medium text-foreground">
            {selectedTask.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedTask.completedPomodoros}/{selectedTask.estimatedPomodoros}{" "}
            pomodoros
          </p>
        </div>
      )}

      {/* Timer Mode */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-semibold ${modeColor}`}>{modeLabel}</h2>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-7xl font-mono font-bold text-foreground tabular-nums">
          {displayTime}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Timer Controls */}
      <TimerControls />
    </Card>
  );
}

function TimerControls() {
  const { isRunning, state, startTimer, pauseTimer, resetTimer, skipTimer } =
    useTimer();

  const handleStop = () => {
    pauseTimer();
    resetTimer();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
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

  return (
    <div
      className="flex justify-center gap-2 flex-wrap"
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Timer controls"
    >
      {!isRunning ? (
        <Button
          onClick={startTimer}
          size="lg"
          className="min-w-[100px]"
          aria-label="Start timer"
        >
          <Play className="w-4 h-4 mr-2" />
          Start
        </Button>
      ) : (
        <Button
          onClick={pauseTimer}
          size="lg"
          variant="outline"
          className="min-w-[100px]"
          aria-label="Pause timer"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
      )}

      <Button
        onClick={skipTimer}
        size="lg"
        variant="outline"
        className="min-w-[100px]"
        aria-label="Skip to next session"
      >
        <SkipForward className="w-4 h-4 mr-2" />
        Skip
      </Button>

      <Button
        onClick={resetTimer}
        size="lg"
        variant="outline"
        className="min-w-[100px]"
        aria-label="Reset timer"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>

      {isRunning && (
        <Button
          onClick={handleStop}
          size="lg"
          variant="destructive"
          className="min-w-[100px]"
          aria-label="Stop timer"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
      )}
    </div>
  );
}

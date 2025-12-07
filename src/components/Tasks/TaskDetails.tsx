"use client";

import { useState } from "react";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Trash2, Minus, Plus } from "lucide-react";

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
  isNew?: boolean;
}

const PRIORITY_COLORS = [
  { color: "#EF4444", name: "Red" },
  { color: "#F97316", name: "Orange" },
  { color: "#EAB308", name: "Yellow" },
  { color: "#22C55E", name: "Green" },
  { color: "#3B82F6", name: "Blue" },
  { color: "#8B5CF6", name: "Purple" },
];

export function TaskDetails({
  task,
  onClose,
  isNew = false,
}: TaskDetailsProps) {
  const { addTask, updateTask, removeTask } = useTasks();
  const { settings } = useSettingsStore();

  const [title, setTitle] = useState(task?.title || "");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    task?.estimatedPomodoros || 4
  );
  const [selectedColor, setSelectedColor] = useState(
    task?.color || PRIORITY_COLORS[4].color
  );

  const focusTime = settings.focusTime;
  const breakTime = settings.shortBreakTime;

  const handleSave = () => {
    if (!title.trim()) return;

    if (isNew) {
      addTask(title, estimatedPomodoros, selectedColor);
    } else if (task) {
      updateTask(task.id, { title, estimatedPomodoros, color: selectedColor });
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      removeTask(task.id);
      onClose();
    }
  };

  const incrementPomodoros = () => {
    if (estimatedPomodoros < 10) {
      setEstimatedPomodoros(estimatedPomodoros + 1);
    }
  };

  const decrementPomodoros = () => {
    if (estimatedPomodoros > 1) {
      setEstimatedPomodoros(estimatedPomodoros - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Task Details</h1>
        {!isNew && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
        {isNew && <div className="w-10" />}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Task Name */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Task Name</Label>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-mono text-sm">&lt;/&gt;</span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task name"
              className="border-0 bg-transparent focus-visible:ring-0 text-base"
            />
          </div>
        </div>

        {/* Color & Priority */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Color & Priority
          </Label>
          <div className="flex gap-3">
            {PRIORITY_COLORS.map((item) => (
              <button
                key={item.color}
                onClick={() => setSelectedColor(item.color)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                  selectedColor === item.color
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : ""
                }`}
                style={{ backgroundColor: item.color }}
              >
                {selectedColor === item.color && (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Pomodoros */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Number of Pomodoros
          </Label>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <span className="font-medium">Est. Pomodoros</span>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={decrementPomodoros}
                disabled={estimatedPomodoros <= 1}
                className="w-8 h-8 rounded-full bg-muted"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center">
                {estimatedPomodoros}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={incrementPomodoros}
                disabled={estimatedPomodoros >= 10}
                className="w-8 h-8 rounded-full bg-muted"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Time per Pomodoro */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Time per Pomodoro
          </Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <span className="font-medium">Focus time</span>
              <span className="text-muted-foreground">{focusTime} min</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <span className="font-medium">Break time</span>
              <span className="text-muted-foreground">{breakTime} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!title.trim()}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-base font-semibold"
        >
          Save Task
        </Button>
      </div>
    </div>
  );
}

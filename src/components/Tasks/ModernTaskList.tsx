"use client";

import { useState } from "react";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { useTimer } from "@/hooks/useTimer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Plus, ChevronRight } from "lucide-react";
import { TaskDetails } from "./TaskDetails";

interface ModernTaskListProps {
  onBack?: () => void;
}

export function ModernTaskList({ onBack }: ModernTaskListProps) {
  const { tasks, toggleComplete, selectTask, selectedTaskId } = useTasks();
  const { setSelectedTaskId } = useTimer();
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleTaskClick = (task: Task) => {
    setViewingTask(task);
  };

  const handleSelectForTimer = (taskId: string) => {
    selectTask(taskId);
    setSelectedTaskId(taskId);
  };

  if (viewingTask || isCreating) {
    return (
      <TaskDetails
        task={viewingTask}
        isNew={isCreating}
        onClose={() => {
          setViewingTask(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border">
        {onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        <h1 className="text-lg font-semibold">Tasks</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsCreating(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      {/* Task Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Active ({activeTasks.length})
            </h2>
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onToggle={() => toggleComplete(task.id)}
                  onClick={() => handleTaskClick(task)}
                  onSelect={() => handleSelectForTimer(task.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={false}
                  onToggle={() => toggleComplete(task.id)}
                  onClick={() => handleTaskClick(task)}
                  onSelect={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first task to get started
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
  onSelect: () => void;
}

function TaskCard({
  task,
  isSelected,
  onToggle,
  onClick,
  onSelect,
}: TaskCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
        isSelected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-card border border-border hover:bg-muted/50"
      } ${task.isCompleted ? "opacity-60" : ""}`}
    >
      {/* Color indicator */}
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: task.color || "#3B82F6" }}
      />

      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => onToggle()}
        className="w-5 h-5"
      />

      <div className="flex-1 min-w-0" onClick={onClick}>
        <p
          className={`font-medium ${
            task.isCompleted ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
        </p>
      </div>

      {!task.isCompleted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSelect}
          className={isSelected ? "text-primary" : "text-muted-foreground"}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

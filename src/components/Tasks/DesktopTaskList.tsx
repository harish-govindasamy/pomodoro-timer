"use client";

import { useState } from "react";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { useTimer } from "@/hooks/useTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Trash2,
  Target,
  CheckCircle2,
  Circle,
  MoreVertical,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DesktopTaskListProps {
  onTaskSelect?: (task: Task) => void;
  compact?: boolean;
}

export function DesktopTaskList({
  onTaskSelect,
  compact = false,
}: DesktopTaskListProps) {
  const {
    tasks,
    activeTasks,
    completedTasks,
    selectedTaskId,
    addTask,
    removeTask,
    toggleComplete,
    selectTask,
    getTaskProgress,
  } = useTasks();
  const { setSelectedTaskId } = useTimer();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskPomodoros);
      setNewTaskTitle("");
      setNewTaskPomodoros(1);
      setIsAdding(false);
    }
  };

  const handleSelectTask = (taskId: string) => {
    selectTask(taskId);
    setSelectedTaskId(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task && onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {activeTasks.length} active, {completedTasks.length} completed
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAdding(true)}
          className="rounded-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-card rounded-xl border border-border space-y-3">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What are you working on?"
            className="text-base"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Pomodoros:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={newTaskPomodoros === n ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    onClick={() => setNewTaskPomodoros(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Active Tasks */}
        {activeTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            progress={getTaskProgress(task)}
            onSelect={() => handleSelectTask(task.id)}
            onToggle={() => toggleComplete(task.id)}
            onDelete={() => removeTask(task.id)}
            onEdit={() => setEditingTask(task)}
            compact={compact}
          />
        ))}

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-4 pb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Completed ({completedTasks.length})
              </span>
            </div>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={false}
                progress={100}
                onSelect={() => {}}
                onToggle={() => toggleComplete(task.id)}
                onDelete={() => removeTask(task.id)}
                onEdit={() => {}}
                compact={compact}
              />
            ))}
          </>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No tasks yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a task to start your focus session
            </p>
            <Button onClick={() => setIsAdding(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create your first task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  progress: number;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  compact?: boolean;
}

function TaskItem({
  task,
  isSelected,
  progress,
  onSelect,
  onToggle,
  onDelete,
  onEdit,
  compact,
}: TaskItemProps) {
  return (
    <div
      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "bg-primary/5 border-primary ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/30 hover:bg-muted/30"
      } ${task.isCompleted ? "opacity-60" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={() => {
              onToggle();
            }}
            className="w-5 h-5"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p
              className={`font-medium ${
                task.isCompleted ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </p>
            {isSelected && !task.isCompleted && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          {!compact && (
            <>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Circle className="w-3 h-3" />
                  {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
                </span>
              </div>

              {!task.isCompleted && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

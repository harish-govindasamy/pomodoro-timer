'use client';

import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useTimer } from '@/hooks/useTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Edit, 
  ChevronUp, 
  ChevronDown,
  CheckCircle2,
  Circle,
  Timer
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  index: number;
  totalTasks: number;
}

export function TaskItem({ task, index, totalTasks }: TaskItemProps) {
  const {
    selectedTaskId,
    selectTask,
    toggleComplete,
    removeTask,
    moveTaskUp,
    moveTaskDown,
    getTaskProgress,
  } = useTasks();
  
  const { mode } = useTimer();

  const isSelected = selectedTaskId === task.id;
  const progress = getTaskProgress(task);
  const isFocusMode = mode === 'focus';

  const handleSelectTask = () => {
    if (!task.isCompleted && isFocusMode) {
      selectTask(task.id);
    }
  };

  const handleToggleComplete = () => {
    toggleComplete(task.id);
  };

  const handleDelete = () => {
    removeTask(task.id);
  };

  const handleMoveUp = () => {
    moveTaskUp(task.id);
  };

  const handleMoveDown = () => {
    moveTaskDown(task.id);
  };

  return (
    <Card 
      className={`p-4 transition-all cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : 'hover:bg-muted/50'
      } ${
        task.isCompleted ? 'opacity-60' : ''
      }`}
      onClick={handleSelectTask}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={handleToggleComplete}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className={`font-medium truncate ${
                task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {task.title}
            </h3>
            {isSelected && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </div>

          {/* Pomodoro Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              <span>
                {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
              </span>
            </div>
            {task.isCompleted && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {task.estimatedPomodoros > 0 && (
            <div className="mb-3">
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveUp();
              }}
              disabled={index === 0}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveDown();
              }}
              disabled={index === totalTasks - 1}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
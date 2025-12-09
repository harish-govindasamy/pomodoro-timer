'use client';

import { useTasks } from '@/hooks/useTasks';
import { TaskItem } from './TaskItem';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

export function TaskList() {
  const { activeTasks, completedTasks, stats } = useTasks();

  const allTasks = [...activeTasks, ...completedTasks];

  return (
    <div className="space-y-4">
      {/* Task Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5" />
            <h3 className="font-semibold">Tasks</h3>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Circle className="w-3 h-3" />
              {stats.total} total
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {stats.completed} done
            </Badge>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-2">
        {allTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Add your first task to get started!</p>
            </div>
          </Card>
        ) : (
          allTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              totalTasks={allTasks.length}
            />
          ))
        )}
      </div>
    </div>
  );
}
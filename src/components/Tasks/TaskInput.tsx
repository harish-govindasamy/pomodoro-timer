'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TaskInput() {
  const [title, setTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState('1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (title.length > 100) {
      setError('Task title must be less than 100 characters');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      addTask(title.trim(), parseInt(estimatedPomodoros));
      setTitle('');
      setEstimatedPomodoros('1');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (error) setError('');
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title">Task Title</Label>
          <Input
            id="task-title"
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={100}
            disabled={isSubmitting}
            aria-describedby={error ? 'task-error' : undefined}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{title.length}/100 characters</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pomodoros">Estimated Pomodoros</Label>
          <Select 
            value={estimatedPomodoros} 
            onValueChange={setEstimatedPomodoros}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'pomodoro' : 'pomodoros'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive" id="task-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Plus className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </Button>
      </form>
    </Card>
  );
}
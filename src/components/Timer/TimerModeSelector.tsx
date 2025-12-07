'use client';

import { useTimer } from '@/hooks/useTimer';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coffee, Zap, TreePine } from 'lucide-react';

export function TimerModeSelector() {
  const { mode, setMode } = useTimer();
  const { focusTime, shortBreakTime, longBreakTime } = useSettings();

  const modes = [
    {
      id: 'focus' as const,
      label: 'Focus',
      icon: Zap,
      duration: focusTime,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-50 dark:hover:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    {
      id: 'shortBreak' as const,
      label: 'Short Break',
      icon: Coffee,
      duration: shortBreakTime,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      id: 'longBreak' as const,
      label: 'Long Break',
      icon: TreePine,
      duration: longBreakTime,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-50 dark:hover:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
    },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {modes.map((modeItem) => {
          const Icon = modeItem.icon;
          const isActive = mode === modeItem.id;
          
          return (
            <Button
              key={modeItem.id}
              variant={isActive ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col gap-2 ${
                isActive
                  ? `${modeItem.color} text-white`
                  : `${modeItem.hoverColor} ${modeItem.borderColor}`
              }`}
              onClick={() => setMode(modeItem.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{modeItem.label}</span>
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {modeItem.duration}m
              </Badge>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
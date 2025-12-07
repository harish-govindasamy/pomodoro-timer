"use client";

import { useState, useEffect } from "react";
import { useStatsStore } from "@/store/statsStore";
import { useTaskStore } from "@/store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  Target,
  Coffee,
  TrendingUp,
  Flame,
  Calendar,
} from "lucide-react";

type TabType = "daily" | "weekly" | "monthly";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, subtitle, icon, color }: StatsCardProps) {
  return (
    <Card className={`p-4 ${color} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </Card>
  );
}

interface EnhancedStatsProps {
  compact?: boolean;
}

export function EnhancedStats({ compact = false }: EnhancedStatsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const { today, history, getWeeklyStats, getMonthlyStats } = useStatsStore();
  const { tasks } = useTaskStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStats = () => {
    switch (activeTab) {
      case "daily":
        return {
          focusTime: today.totalFocusTimeMinutes,
          tasksCompleted: today.tasksCompleted,
          sessionsCompleted: today.pomodorosCompleted,
          breaksTaken: Math.max(0, today.pomodorosCompleted - 1),
        };
      case "weekly": {
        const weekStats = getWeeklyStats();
        const totals = weekStats.reduce(
          (acc, day) => ({
            focusTime: acc.focusTime + day.totalFocusTimeMinutes,
            tasks: acc.tasks + day.tasksCompleted,
            sessions: acc.sessions + day.pomodorosCompleted,
          }),
          { focusTime: 0, tasks: 0, sessions: 0 }
        );
        return {
          focusTime: totals.focusTime,
          tasksCompleted: totals.tasks,
          sessionsCompleted: totals.sessions,
          breaksTaken: Math.max(0, totals.sessions - 1),
        };
      }
      case "monthly": {
        const monthStats = getMonthlyStats();
        const totals = monthStats.reduce(
          (acc, day) => ({
            focusTime: acc.focusTime + day.totalFocusTimeMinutes,
            tasks: acc.tasks + day.tasksCompleted,
            sessions: acc.sessions + day.pomodorosCompleted,
          }),
          { focusTime: 0, tasks: 0, sessions: 0 }
        );
        return {
          focusTime: totals.focusTime,
          tasksCompleted: totals.tasks,
          sessionsCompleted: totals.sessions,
          breaksTaken: Math.max(0, totals.sessions - 1),
        };
      }
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const calculateStreak = () => {
    let streak = 0;
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length; i++) {
      const historyDate = new Date(sortedHistory[i].date);
      historyDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        historyDate.getTime() === expectedDate.getTime() &&
        sortedHistory[i].pomodorosCompleted > 0
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  if (!mounted) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading...</div>
    );
  }

  const stats = getStats();
  const streak = calculateStreak();

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title="Focus Time"
          value={formatTime(stats.focusTime)}
          icon={<Clock className="w-5 h-5" />}
          color="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
        />
        <StatsCard
          title="Sessions"
          value={stats.sessionsCompleted}
          icon={<Target className="w-5 h-5" />}
          color="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl p-1">
          <TabsTrigger
            value="daily"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            This Month
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Focus Time"
          value={formatTime(stats.focusTime)}
          subtitle={`${Math.round(
            stats.focusTime / settings.focusTime
          )} pomodoros`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
        />
        <StatsCard
          title="Tasks Done"
          value={stats.tasksCompleted}
          subtitle={`${tasks.filter((t) => !t.isCompleted).length} remaining`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
        />
        <StatsCard
          title="Sessions"
          value={stats.sessionsCompleted}
          subtitle="Pomodoros completed"
          icon={<Target className="w-6 h-6" />}
          color="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
        />
        <StatsCard
          title="Streak"
          value={`${streak} days`}
          subtitle={streak > 0 ? "Keep it up!" : "Start today!"}
          icon={<Flame className="w-6 h-6" />}
          color="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
        />
      </div>

      {/* Daily Goal Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium">Daily Goal</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {today.pomodorosCompleted} / 8 sessions
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
            style={{
              width: `${Math.min((today.pomodorosCompleted / 8) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {today.pomodorosCompleted >= 8
            ? "🎉 Daily goal achieved!"
            : `${
                8 - today.pomodorosCompleted
              } more sessions to reach your goal`}
        </p>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-medium">This Week</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split("T")[0];
            const dayStats = history.find((h) => h.date === dateStr);
            const sessions = dayStats?.pomodorosCompleted || 0;
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const isToday = i === 6;

            return (
              <div key={i} className="text-center">
                <p
                  className={`text-xs mb-1 ${
                    isToday ? "font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {dayName}
                </p>
                <div
                  className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-sm font-medium ${
                    sessions > 0
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  } ${isToday ? "ring-2 ring-primary" : ""}`}
                >
                  {sessions}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

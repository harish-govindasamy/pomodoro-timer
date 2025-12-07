"use client";

import { useState, useEffect } from "react";
import { useStatsStore } from "@/store/statsStore";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Timer,
  Coffee,
} from "lucide-react";

interface StatisticsPageProps {
  onBack?: () => void;
}

type TabType = "daily" | "weekly" | "monthly";

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("weekly");
  const { today, history, getWeeklyStats, getMonthlyStats } = useStatsStore();
  const { tasks } = useTaskStore();

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
          breaksTaken: Math.floor(today.pomodorosCompleted * 0.9),
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
          breaksTaken: Math.floor(totals.sessions * 0.9),
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
          breaksTaken: Math.floor(totals.sessions * 0.9),
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

  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="w-10" />
          <h1 className="text-lg font-semibold">Statistics</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

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
        <h1 className="text-lg font-semibold">Statistics</h1>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Tab Selector */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-full p-1">
            <TabsTrigger
              value="daily"
              className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Daily
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">Focus time</span>
            </div>
            <p className="text-xl font-bold">{formatTime(stats.focusTime)}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">Tasks done</span>
            </div>
            <p className="text-xl font-bold">{stats.tasksCompleted} tasks</p>
          </div>
        </div>

        {/* Productivity Chart Placeholder */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Productivity</h3>
          <div className="h-32 bg-muted/30 rounded-2xl flex items-center justify-center border border-border">
            <p className="text-muted-foreground text-sm">Chart coming soon</p>
          </div>
        </div>

        {/* Pomodoro Stats */}
        <div>
          <h3 className="font-semibold mb-4">Pomodoro</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
                <Timer className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sessions completed</p>
                <p className="text-sm text-muted-foreground">
                  Total this{" "}
                  {activeTab === "daily"
                    ? "day"
                    : activeTab === "weekly"
                    ? "week"
                    : "month"}
                </p>
              </div>
              <span className="text-2xl font-bold">
                {stats.sessionsCompleted}
              </span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-950/50 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Breaks taken</p>
                <p className="text-sm text-muted-foreground">
                  Short & long breaks
                </p>
              </div>
              <span className="text-2xl font-bold">{stats.breaksTaken}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

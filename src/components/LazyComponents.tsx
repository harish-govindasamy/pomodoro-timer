"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, BarChart3, Settings, ListTodo } from "lucide-react";

// Loading skeleton for Statistics Page
function StatisticsLoadingSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background p-4 space-y-6">
      <div className="flex items-center justify-center gap-2">
        <BarChart3 className="w-5 h-5 text-muted-foreground animate-pulse" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

// Loading skeleton for Settings Page
function SettingsLoadingSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background p-4 space-y-6">
      <div className="flex items-center justify-center gap-2">
        <Settings className="w-5 h-5 text-muted-foreground animate-pulse" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Loading skeleton for Task List
function TaskListLoadingSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background p-4 space-y-4">
      <div className="flex items-center justify-center gap-2">
        <ListTodo className="w-5 h-5 text-muted-foreground animate-pulse" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for Enhanced Stats
function EnhancedStatsLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// Loading skeleton for Timer Display
function TimerLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
      <div className="relative">
        <Skeleton className="w-[280px] h-[280px] rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Timer className="w-12 h-12 text-muted-foreground animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  );
}

// Lazy loaded Statistics Page
export const LazyStatisticsPage = dynamic(
  () =>
    import("@/components/StatisticsPage").then((mod) => ({
      default: mod.StatisticsPage,
    })),
  {
    loading: () => <StatisticsLoadingSkeleton />,
    ssr: false,
  }
);

// Lazy loaded Settings Page
export const LazySettingsPage = dynamic(
  () =>
    import("@/components/SettingsPage").then((mod) => ({
      default: mod.SettingsPage,
    })),
  {
    loading: () => <SettingsLoadingSkeleton />,
    ssr: false,
  }
);

// Lazy loaded Modern Task List
export const LazyModernTaskList = dynamic(
  () =>
    import("@/components/Tasks/ModernTaskList").then((mod) => ({
      default: mod.ModernTaskList,
    })),
  {
    loading: () => <TaskListLoadingSkeleton />,
    ssr: false,
  }
);

// Lazy loaded Desktop Task List
export const LazyDesktopTaskList = dynamic(
  () =>
    import("@/components/Tasks/DesktopTaskList").then((mod) => ({
      default: mod.DesktopTaskList,
    })),
  {
    loading: () => <TaskListLoadingSkeleton />,
    ssr: false,
  }
);

// Lazy loaded Enhanced Stats (for desktop)
export const LazyEnhancedStats = dynamic(
  () =>
    import("@/components/EnhancedStats").then((mod) => ({
      default: mod.EnhancedStats,
    })),
  {
    loading: () => <EnhancedStatsLoadingSkeleton />,
    ssr: false,
  }
);

// Lazy loaded Enhanced Timer Display
export const LazyEnhancedTimerDisplay = dynamic(
  () =>
    import("@/components/Timer/EnhancedTimerDisplay").then((mod) => ({
      default: mod.EnhancedTimerDisplay,
    })),
  {
    loading: () => <TimerLoadingSkeleton />,
    ssr: false,
  }
);

// Lazy loaded Task Details
export const LazyTaskDetails = dynamic(
  () =>
    import("@/components/Tasks/TaskDetails").then((mod) => ({
      default: mod.TaskDetails,
    })),
  {
    loading: () => (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    ),
    ssr: false,
  }
);

// Export loading skeletons for reuse
export {
  StatisticsLoadingSkeleton,
  SettingsLoadingSkeleton,
  TaskListLoadingSkeleton,
  EnhancedStatsLoadingSkeleton,
  TimerLoadingSkeleton,
};

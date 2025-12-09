"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useStatsStore } from "@/store/statsStore";
import { BottomNav } from "@/components/BottomNav";
import { EnhancedTimerDisplay } from "@/components/Timer/EnhancedTimerDisplay";
import { Timer, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LazyModernTaskList,
  LazySettingsPage,
  LazyStatisticsPage,
  LazyTaskDetails,
} from "@/components/LazyComponents";

type ActiveTab = "timer" | "tasks" | "stats" | "settings";

function TimerPage() {
  const { today } = useStatsStore();

  return (
    <div className="flex flex-col h-full">
      {/* Minimal Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src="/logo.svg"
              alt="Pomofocus"
              className="w-8 h-8 drop-shadow-sm"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Pomofocus
            </h1>
          </div>
        </div>

        {/* Today's Stats Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-full border border-border/20">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-foreground">
            {today?.pomodorosCompleted || 0}
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
      </header>

      {/* Timer Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 pb-4 overflow-y-auto">
        <EnhancedTimerDisplay size="medium" showTaskCard={true} />
      </div>
    </div>
  );
}

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("timer");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize stores
  const { loadTasks } = useTaskStore();
  const { loadSettings } = useSettingsStore();
  const { loadStats } = useStatsStore();

  useEffect(() => {
    loadTasks();
    loadSettings();
    loadStats();
    setMounted(true);
  }, [loadTasks, loadSettings, loadStats]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsCreatingTask(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          {/* Minimal loading state */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Timer className="w-8 h-8 text-primary/40 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (isCreatingTask) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20">
        <LazyTaskDetails
          task={null}
          isNew={true}
          onClose={() => setIsCreatingTask(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Main Content with smooth transitions */}
      <main className="flex-1 flex flex-col relative">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-out",
            activeTab === "timer"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none",
          )}
        >
          <TimerPage />
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-out",
            activeTab === "tasks"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none",
          )}
        >
          <LazyModernTaskList />
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-out",
            activeTab === "stats"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none",
          )}
        >
          <LazyStatisticsPage />
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-out",
            activeTab === "settings"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none",
          )}
        >
          <LazySettingsPage />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFabClick={() => setIsCreatingTask(true)}
      />
    </div>
  );
}

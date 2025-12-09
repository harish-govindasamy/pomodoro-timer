"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useStatsStore } from "@/store/statsStore";
import { BottomNav } from "@/components/BottomNav";
import { EnhancedTimerDisplay } from "@/components/Timer/EnhancedTimerDisplay";
import { Button } from "@/components/ui/button";
import { Timer, ChevronLeft, Settings } from "lucide-react";
import {
  LazyModernTaskList,
  LazySettingsPage,
  LazyStatisticsPage,
  LazyTaskDetails,
} from "@/components/LazyComponents";

type ActiveTab = "timer" | "tasks" | "stats" | "settings";

function TimerPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/80 backdrop-blur-lg">
        <Button variant="ghost" size="icon" className="invisible">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Pomofocus" className="w-8 h-8" />
          <h1 className="text-lg font-semibold">Pomofocus</h1>
        </div>
        <Button variant="ghost" size="icon" className="invisible">
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 overflow-y-auto">
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
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Timer className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
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
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === "timer" && <TimerPage />}
        {activeTab === "tasks" && <LazyModernTaskList />}
        {activeTab === "stats" && <LazyStatisticsPage />}
        {activeTab === "settings" && <LazySettingsPage />}
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

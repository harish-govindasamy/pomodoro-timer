"use client";

import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { Onboarding } from "@/components/Onboarding";
import { useTaskStore } from "@/store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useStatsStore } from "@/store/statsStore";

function AppContent() {
  const [mounted, setMounted] = useState(false);

  // Initialize stores
  const { loadTasks } = useTaskStore();
  const { loadSettings } = useSettingsStore();
  const { loadStats } = useStatsStore();

  useEffect(() => {
    setMounted(true);
    // Load all data on app mount
    loadTasks();
    loadSettings();
    loadStats();
  }, [loadTasks, loadSettings, loadStats]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-48 h-48 rounded-full bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding for first-time users */}
      <Onboarding />

      {/* Desktop Layout - visible on lg and above */}
      <div className="hidden lg:block min-h-screen">
        <DesktopLayout />
      </div>

      {/* Mobile Layout - visible below lg */}
      <div className="lg:hidden min-h-screen">
        <MobileLayout />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

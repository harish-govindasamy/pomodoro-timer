"use client";

import { Timer, ListTodo, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "timer" | "tasks" | "stats" | "settings";
  onTabChange: (tab: "timer" | "tasks" | "stats" | "settings") => void;
  onFabClick?: () => void;
}

export function BottomNav({
  activeTab,
  onTabChange,
  onFabClick,
}: BottomNavProps) {
  const tabs = [
    { id: "timer" as const, icon: Timer, label: "Timer" },
    { id: "tasks" as const, icon: ListTodo, label: "Tasks" },
    { id: "stats" as const, icon: BarChart3, label: "Stats" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Action Button */}
        <div className="relative -top-4">
          <button
            onClick={onFabClick}
            className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all"
          >
            <span className="text-2xl font-bold text-white">+</span>
          </button>
        </div>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

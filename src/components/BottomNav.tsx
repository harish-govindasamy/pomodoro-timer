"use client";

import { useCallback } from "react";
import { Timer, ListTodo, BarChart3, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "timer" | "tasks" | "stats" | "settings";
  onTabChange: (tab: "timer" | "tasks" | "stats" | "settings") => void;
  onFabClick?: () => void;
}

// Haptic feedback utility
function triggerHapticFeedback(type: "light" | "medium" | "heavy" = "light") {
  if (typeof window === "undefined") return;

  // Check for Vibration API support
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
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

  const handleTabChange = useCallback(
    (tabId: "timer" | "tasks" | "stats" | "settings") => {
      triggerHapticFeedback("light");
      onTabChange(tabId);
    },
    [onTabChange],
  );

  const handleFabClick = useCallback(() => {
    triggerHapticFeedback("medium");
    onFabClick?.();
  }, [onFabClick]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {/* Left side tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.label} tab${isActive ? ", currently selected" : ""}`}
              tabIndex={0}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110 text-primary",
                  )}
                  aria-hidden="true"
                />
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-all duration-200",
                  isActive && "text-primary font-semibold",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Floating Action Button */}
        <div className="relative -top-4">
          <button
            onClick={handleFabClick}
            className={cn(
              "w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600",
              "flex items-center justify-center",
              "shadow-lg shadow-blue-500/30",
              "hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105",
              "active:scale-95",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label="Add new task"
            title="Add new task"
          >
            <Plus
              className="w-6 h-6 text-white"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </button>
          {/* Subtle glow effect */}
          <div
            className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl -z-10 animate-pulse"
            aria-hidden="true"
          />
        </div>

        {/* Right side tabs */}
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.label} tab${isActive ? ", currently selected" : ""}`}
              tabIndex={0}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110 text-primary",
                  )}
                  aria-hidden="true"
                />
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-all duration-200",
                  isActive && "text-primary font-semibold",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Keyboard navigation hint for screen readers */}
      <div className="sr-only" role="note">
        Use Tab key to navigate between menu items. Press Enter or Space to
        select.
      </div>
    </nav>
  );
}

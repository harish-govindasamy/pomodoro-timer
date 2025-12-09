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
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Clean nav container */}
      <div className="relative mx-3 mb-3">
        {/* Main nav container */}
        <div
          className={cn(
            "relative flex items-center justify-around",
            "h-14 px-2 rounded-2xl",
            "bg-background/90 backdrop-blur-md",
            "border border-border/40",
            "shadow-sm",
          )}
        >
          {/* Left side tabs */}
          {tabs.slice(0, 2).map((tab) => (
            <NavButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}

          {/* Floating Action Button */}
          <div className="relative -mt-6">
            <button
              onClick={handleFabClick}
              className={cn(
                "relative w-12 h-12 rounded-xl",
                "bg-primary",
                "flex items-center justify-center",
                "shadow-md shadow-primary/20",
                "hover:shadow-lg hover:shadow-primary/30",
                "hover:scale-105 active:scale-95",
                "transition-all duration-200 ease-out",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
              aria-label="Add new task"
              title="Add new task"
            >
              <Plus
                className="relative w-5 h-5 text-white"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>

            {/* Label below FAB */}
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-muted-foreground whitespace-nowrap">
              New
            </span>
          </div>

          {/* Right side tabs */}
          {tabs.slice(2).map((tab) => (
            <NavButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Screen reader hint */}
      <div className="sr-only" role="note">
        Use Tab key to navigate between menu items. Press Enter or Space to
        select.
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center",
        "w-12 h-10 rounded-lg",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "active:scale-95",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
      role="tab"
      aria-selected={isActive}
      aria-label={`${label} tab${isActive ? ", currently selected" : ""}`}
      tabIndex={0}
    >
      {/* Icon container */}
      <div className="relative">
        <Icon
          className={cn(
            "w-5 h-5 transition-all duration-200",
            isActive && "scale-105",
          )}
          aria-hidden="true"
        />

        {/* Active dot indicator */}
        <div
          className={cn(
            "absolute -bottom-1 left-1/2 -translate-x-1/2",
            "w-1 h-1 rounded-full bg-primary",
            "transition-all duration-200",
            isActive ? "opacity-100 scale-100" : "opacity-0 scale-0",
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "relative text-[9px] mt-0.5 font-medium transition-all duration-200",
          isActive && "font-semibold",
        )}
      >
        {label}
      </span>
    </button>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  const { mode } = useTimer();

  // Map timer mode to CSS class
  const modeClass =
    mode === "focus"
      ? "mode-focus"
      : mode === "shortBreak"
        ? "mode-break"
        : "mode-longbreak";

  return (
    <>
      {/* Animated gradient mesh */}
      <div className={cn("gradient-mesh", modeClass, className)}>
        <div className="gradient-blob gradient-blob-1" />
        <div className="gradient-blob gradient-blob-2" />
        <div className="gradient-blob gradient-blob-3" />
      </div>

      {/* Subtle noise texture for depth */}
      <div className="noise-overlay" />
    </>
  );
}

// Standalone background without timer dependency (for non-timer pages)
export function StaticBackground({
  variant = "focus",
  className,
}: {
  variant?: "focus" | "break" | "longbreak";
  className?: string;
}) {
  const modeClass =
    variant === "focus"
      ? "mode-focus"
      : variant === "break"
        ? "mode-break"
        : "mode-longbreak";

  return (
    <>
      <div className={cn("gradient-mesh", modeClass, className)}>
        <div className="gradient-blob gradient-blob-1" />
        <div className="gradient-blob gradient-blob-2" />
        <div className="gradient-blob gradient-blob-3" />
      </div>
      <div className="noise-overlay" />
    </>
  );
}

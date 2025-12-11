"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  variant?: "default" | "elevated" | "subtle";
  hover?: boolean;
  glow?: "focus" | "break" | "longbreak" | "none";
  className?: string;
  children?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, variant = "default", hover = true, glow = "none", children },
    ref,
  ) => {
    const baseStyles =
      "relative rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300";

    const variantStyles = {
      default: cn(
        "bg-white/60 dark:bg-slate-900/60",
        "border border-white/30 dark:border-white/10",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.5),0_8px_32px_rgba(0,0,0,0.08)]",
        "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.4)]",
      ),
      elevated: cn(
        "bg-white/70 dark:bg-slate-900/70",
        "border border-white/40 dark:border-white/15",
        "shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.6),0_20px_50px_rgba(0,0,0,0.12)]",
        "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.5)]",
      ),
      subtle: cn(
        "bg-white/40 dark:bg-slate-900/40",
        "border border-white/20 dark:border-white/05",
        "shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
      ),
    };

    const glowStyles = {
      none: "",
      focus:
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-red-500/10 before:to-orange-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      break:
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-blue-500/10 before:to-purple-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      longbreak:
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-emerald-500/10 before:to-green-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          glowStyles[glow],
          hover && "hover:shadow-2xl hover:-translate-y-1",
          className,
        )}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";

// Glass Card Header
type GlassCardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pb-4", className)} {...props} />
  ),
);
GlassCardHeader.displayName = "GlassCardHeader";

// Glass Card Content
type GlassCardContentProps = React.HTMLAttributes<HTMLDivElement>;

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  GlassCardContentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

// Glass Card Title
type GlassCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  GlassCardTitleProps
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

export { GlassCard, GlassCardHeader, GlassCardContent, GlassCardTitle };

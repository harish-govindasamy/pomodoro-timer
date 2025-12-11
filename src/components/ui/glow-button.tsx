"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  variant?: "focus" | "break" | "longbreak" | "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      glow = true,
      shimmer = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles = cn(
      "relative inline-flex items-center justify-center font-semibold",
      "rounded-xl transition-all duration-300",
      "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "overflow-hidden",
    );

    const sizeStyles = {
      sm: "h-9 px-4 text-sm gap-1.5",
      md: "h-11 px-6 text-sm gap-2",
      lg: "h-13 px-8 text-base gap-2",
      xl: "h-16 px-10 text-lg gap-3",
    };

    const variantStyles = {
      focus: cn(
        "bg-gradient-to-br from-red-500 to-orange-500 text-white",
        "hover:from-red-600 hover:to-orange-600",
        "focus-visible:ring-red-500",
        "shadow-lg shadow-red-500/25",
        glow && "hover:shadow-xl hover:shadow-red-500/30",
      ),
      break: cn(
        "bg-gradient-to-br from-blue-500 to-purple-500 text-white",
        "hover:from-blue-600 hover:to-purple-600",
        "focus-visible:ring-blue-500",
        "shadow-lg shadow-blue-500/25",
        glow && "hover:shadow-xl hover:shadow-blue-500/30",
      ),
      longbreak: cn(
        "bg-gradient-to-br from-emerald-500 to-green-500 text-white",
        "hover:from-emerald-600 hover:to-green-600",
        "focus-visible:ring-emerald-500",
        "shadow-lg shadow-emerald-500/25",
        glow && "hover:shadow-xl hover:shadow-emerald-500/30",
      ),
      primary: cn(
        "bg-gradient-to-br from-violet-500 to-indigo-600 text-white",
        "hover:from-violet-600 hover:to-indigo-700",
        "focus-visible:ring-violet-500",
        "shadow-lg shadow-violet-500/25",
        glow && "hover:shadow-xl hover:shadow-violet-500/30",
      ),
      secondary: cn(
        "bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white",
        "border border-slate-200 dark:border-slate-700",
        "hover:bg-white dark:hover:bg-slate-800",
        "focus-visible:ring-slate-500",
        "shadow-md",
        glow && "hover:shadow-lg",
      ),
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {/* Shimmer effect overlay */}
        {shimmer && !disabled && (
          <span className="absolute inset-0 overflow-hidden rounded-xl">
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </span>
        )}

        {/* Glow effect */}
        {glow && variant !== "secondary" && (
          <span
            className={cn(
              "absolute inset-0 -z-10 rounded-xl opacity-0 blur-xl transition-opacity duration-300",
              "group-hover:opacity-100",
              variant === "focus" && "bg-red-500",
              variant === "break" && "bg-blue-500",
              variant === "longbreak" && "bg-emerald-500",
              variant === "primary" && "bg-violet-500",
            )}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  },
);

GlowButton.displayName = "GlowButton";

// Icon Button variant
interface GlowIconButtonProps extends HTMLMotionProps<"button"> {
  variant?: "focus" | "break" | "longbreak" | "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
}

const GlowIconButton = React.forwardRef<HTMLButtonElement, GlowIconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      glow = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeStyles = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    const variantStyles = {
      focus: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
      break: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      longbreak: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
      primary: "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
      secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
      ghost:
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl",
          "transition-colors duration-200",
          "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.05 }}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

GlowIconButton.displayName = "GlowIconButton";

export { GlowButton, GlowIconButton };

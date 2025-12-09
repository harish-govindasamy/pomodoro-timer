"use client";

import { motion } from "framer-motion";
import { Lock, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AchievementProgress, RARITY_CONFIG } from "@/types/achievement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface AchievementCardProps {
  achievement: AchievementProgress;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

export function AchievementCard({
  achievement,
  size = "md",
  showProgress = true,
  animate = true,
  onClick,
}: AchievementCardProps) {
  const rarityConfig = RARITY_CONFIG[achievement.rarity];
  const isUnlocked = achievement.isUnlocked;
  const isHidden = !isUnlocked && achievement.progressPercentage === 0;

  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "text-2xl",
      iconContainer: "h-10 w-10",
      title: "text-sm",
      description: "text-xs",
      points: "text-xs",
    },
    md: {
      container: "p-4",
      icon: "text-3xl",
      iconContainer: "h-14 w-14",
      title: "text-base",
      description: "text-sm",
      points: "text-sm",
    },
    lg: {
      container: "p-5",
      icon: "text-4xl",
      iconContainer: "h-18 w-18",
      title: "text-lg",
      description: "text-base",
      points: "text-base",
    },
  };

  const classes = sizeClasses[size];

  const CardContent = (
    <motion.div
      whileHover={animate ? { scale: 1.02, y: -2 } : undefined}
      whileTap={animate && onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "relative rounded-xl border-2 transition-all duration-300",
        classes.container,
        isUnlocked
          ? cn(
              rarityConfig.bgColor,
              rarityConfig.borderColor,
              "shadow-md hover:shadow-lg",
            )
          : "bg-muted/30 border-muted-foreground/20 opacity-60 hover:opacity-80",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      {/* Legendary glow effect */}
      {isUnlocked && achievement.rarity === "legendary" && (
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-amber-400/20 via-yellow-400/20 to-amber-400/20 animate-pulse" />
      )}

      {/* Unlocked sparkle */}
      {isUnlocked && animate && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </motion.div>
      )}

      <div className="relative flex items-start gap-4">
        {/* Icon Container */}
        <div
          className={cn(
            "shrink-0 rounded-xl flex items-center justify-center",
            classes.iconContainer,
            isUnlocked
              ? cn(
                  rarityConfig.bgColor,
                  "ring-2",
                  `ring-${achievement.rarity === "legendary" ? "amber" : achievement.rarity === "epic" ? "purple" : achievement.rarity === "rare" ? "blue" : "gray"}-400/50`,
                )
              : "bg-muted",
          )}
        >
          {isHidden ? (
            <Lock className="h-6 w-6 text-muted-foreground" />
          ) : (
            <span
              className={cn(
                classes.icon,
                !isUnlocked && "grayscale opacity-50",
              )}
            >
              {achievement.icon}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={cn(
                  "font-semibold leading-tight",
                  classes.title,
                  isUnlocked ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {isHidden ? "???" : achievement.name}
              </h3>
              <p
                className={cn(
                  "mt-0.5 line-clamp-2",
                  classes.description,
                  "text-muted-foreground",
                )}
              >
                {isHidden ? "Complete more to unlock" : achievement.description}
              </p>
            </div>

            {/* Points Badge */}
            <div
              className={cn(
                "shrink-0 px-2 py-0.5 rounded-full font-medium",
                classes.points,
                isUnlocked
                  ? cn(rarityConfig.bgColor, rarityConfig.textColor)
                  : "bg-muted text-muted-foreground",
              )}
            >
              +{achievement.points}
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && !isUnlocked && !isHidden && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {achievement.currentProgress} / {achievement.requirement}
                </span>
              </div>
              <Progress
                value={achievement.progressPercentage}
                className="h-1.5"
              />
            </div>
          )}

          {/* Unlocked Badge */}
          {isUnlocked && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="h-3.5 w-3.5" />
                <span>Unlocked</span>
              </div>
              {achievement.unlockedAt && (
                <span className="text-xs text-muted-foreground">
                  •{" "}
                  {new Date(achievement.unlockedAt).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              )}
            </div>
          )}

          {/* Rarity Badge */}
          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                rarityConfig.bgColor,
                rarityConfig.textColor,
              )}
            >
              {rarityConfig.label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (onClick) {
    return CardContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{CardContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">
            {achievement.description}
          </p>
          {!isUnlocked && (
            <p className="text-xs mt-1">
              {achievement.currentProgress} / {achievement.requirement} (
              {Math.round(achievement.progressPercentage)}%)
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

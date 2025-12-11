"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Target,
  TrendingUp,
  Minus,
  Plus,
  Check,
  Sparkles,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GoalData {
  goal: {
    id: string | null;
    targetPomodoros: number;
    targetFocusMinutes: number | null;
    isActive: boolean;
  };
  progress: {
    completedPomodoros: number;
    totalFocusMinutes: number;
    progressPercentage: number;
    goalMet: boolean;
    date: string;
  };
}

interface DailyGoalCardProps {
  className?: string;
  variant?: "default" | "compact" | "inline";
  showEditButton?: boolean;
}

export function DailyGoalCard({
  className,
  variant = "default",
  showEditButton = true,
}: DailyGoalCardProps) {
  const { data: session } = useSession();
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newTarget, setNewTarget] = useState(8);
  const [isSaving, setIsSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchGoal = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoalData(data);
        setNewTarget(data.goal.targetPomodoros);

        // Trigger celebration if goal just met
        if (data.progress.goalMet && !goalData?.progress.goalMet) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      }
    } catch (error) {
      console.error("Error fetching goal:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, goalData?.progress.goalMet]);

  useEffect(() => {
    fetchGoal();
    // Refresh every 30 seconds
    const interval = setInterval(fetchGoal, 30000);
    return () => clearInterval(interval);
  }, [fetchGoal]);

  const handleSaveGoal = async () => {
    setIsSaving(true);
    try {
      const method = goalData?.goal.id ? "PATCH" : "POST";
      const response = await fetch("/api/goals", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPomodoros: newTarget }),
      });

      if (response.ok) {
        await fetchGoal();
        setIsEditOpen(false);
      }
    } catch (error) {
      console.error("Error saving goal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.user) {
    return null; // Don't show for non-authenticated users
  }

  if (isLoading) {
    return (
      <Card className={cn("p-4 animate-pulse", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-2 bg-muted rounded w-full" />
          </div>
        </div>
      </Card>
    );
  }

  const { goal, progress } = goalData || {
    goal: {
      targetPomodoros: 8,
      isActive: false,
      id: null,
      targetFocusMinutes: null,
    },
    progress: {
      completedPomodoros: 0,
      progressPercentage: 0,
      goalMet: false,
      totalFocusMinutes: 0,
      date: "",
    },
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          {progress.completedPomodoros}/{goal.targetPomodoros}
        </span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24">
          <motion.div
            className={cn(
              "h-full rounded-full",
              progress.goalMet ? "bg-green-500" : "bg-primary",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {progress.goalMet && <Check className="h-4 w-4 text-green-500" />}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", className)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                progress.goalMet
                  ? "bg-green-500/10 text-green-500"
                  : "bg-primary/10 text-primary",
              )}
            >
              {progress.goalMet ? (
                <Check className="h-4 w-4" />
              ) : (
                <Target className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {progress.completedPomodoros} / {goal.targetPomodoros}
              </p>
              <p className="text-xs text-muted-foreground">Daily Goal</p>
            </div>
          </div>
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                progress.goalMet ? "bg-green-500" : "bg-primary",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercentage}%` }}
            />
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <>
      <Card className={cn("relative overflow-hidden", className)}>
        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-green-600">Goal Met! 🎉</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  progress.goalMet
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary/10 text-primary",
                )}
              >
                {progress.goalMet ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Target className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">Daily Goal</h3>
                <p className="text-xs text-muted-foreground">
                  {progress.goalMet
                    ? "Completed!"
                    : `${goal.targetPomodoros - progress.completedPomodoros} more to go`}
                </p>
              </div>
            </div>

            {showEditButton && (
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs">
                  <DialogHeader>
                    <DialogTitle>Set Daily Goal</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      How many pomodoros do you want to complete today?
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNewTarget(Math.max(1, newTarget - 1))}
                        disabled={newTarget <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-4xl font-bold tabular-nums w-16 text-center">
                        {newTarget}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setNewTarget(Math.min(50, newTarget + 1))
                        }
                        disabled={newTarget >= 50}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      ~{newTarget * 25} minutes of focus
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveGoal}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Saving..." : "Save Goal"}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {progress.completedPomodoros} / {goal.targetPomodoros}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  progress.goalMet
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-primary to-primary/80",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress.progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  {Math.round(progress.totalFocusMinutes)} min focused
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{progress.progressPercentage}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

// Hook for using goal data programmatically
export function useDailyGoal() {
  const { data: session } = useSession();
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoal = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoalData(data);
      }
    } catch (error) {
      console.error("Error fetching goal:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  return {
    goal: goalData?.goal ?? null,
    progress: goalData?.progress ?? null,
    isLoading,
    refresh: fetchGoal,
  };
}

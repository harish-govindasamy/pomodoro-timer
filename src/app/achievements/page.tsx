"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowLeft,
  Loader2,
  Star,
  Target,
  Flame,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import {
  AchievementProgress,
  AchievementCategory,
  CATEGORY_CONFIG,
} from "@/types/achievement";

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  recentUnlocks: Array<{
    id: string;
    achievementId: string;
    unlockedAt: string;
    achievement: {
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      rarity: string;
      points: number;
    };
  }>;
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/achievements");
      return;
    }

    if (status === "authenticated") {
      fetchAchievements();
    }
  }, [status, router]);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/achievements");

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      const data = await response.json();
      setAchievements(data.achievements);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Failed to load achievements
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchAchievements}>Try Again</Button>
        </div>
      </div>
    );
  }

  const progressPercentage = stats
    ? (stats.unlockedAchievements / stats.totalAchievements) * 100
    : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pomodoros":
        return <Target className="h-4 w-4" />;
      case "streaks":
        return <Flame className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      case "tasks":
        return <Star className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  // Category stats
  const categoryStats = Object.keys(CATEGORY_CONFIG).map((category) => {
    const categoryAchievements = achievements.filter(
      (a) => a.category === category,
    );
    const unlocked = categoryAchievements.filter((a) => a.isUnlocked).length;
    return {
      category: category as AchievementCategory,
      config: CATEGORY_CONFIG[category as AchievementCategory],
      total: categoryAchievements.length,
      unlocked,
    };
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Achievements</h1>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{stats.earnedPoints}</span>
              <span className="text-muted-foreground">points</span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Overall Progress */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Trophy Icon and Stats */}
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <Trophy className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {stats.unlockedAchievements} / {stats.totalAchievements}
                    </h2>
                    <p className="text-muted-foreground">
                      Achievements Unlocked
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                {/* Points */}
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold text-primary">
                    {stats.earnedPoints}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    of {stats.totalPoints} points
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryStats.map(({ category, config, total, unlocked }) => (
              <div
                key={category}
                className="bg-card rounded-xl p-4 border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{config.icon}</span>
                  <span className="font-medium text-sm">{config.label}</span>
                </div>
                <div className="text-2xl font-bold">
                  {unlocked}/{total}
                </div>
                <Progress
                  value={(unlocked / total) * 100}
                  className="h-1.5 mt-2"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Unlocks */}
        {stats && stats.recentUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold mb-4">Recent Unlocks</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stats.recentUnlocks.map((unlock) => (
                <div
                  key={unlock.id}
                  className="shrink-0 bg-card rounded-xl p-4 border min-w-[200px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{unlock.achievement.icon}</span>
                    <div>
                      <p className="font-medium">{unlock.achievement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(unlock.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AchievementGrid
            achievements={achievements}
            isLoading={isLoading}
            showFilters={true}
            showSearch={true}
            columns={2}
          />
        </motion.div>
      </main>
    </div>
  );
}

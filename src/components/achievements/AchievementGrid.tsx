"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Trophy, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementCard } from "./AchievementCard";
import {
  AchievementProgress,
  AchievementCategory,
  CATEGORY_CONFIG,
  RARITY_CONFIG,
  AchievementRarity,
} from "@/types/achievement";
import { cn } from "@/lib/utils";

interface AchievementGridProps {
  achievements: AchievementProgress[];
  isLoading?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

type FilterType = "all" | "unlocked" | "locked" | "in-progress";

export function AchievementGrid({
  achievements,
  isLoading = false,
  showFilters = true,
  showSearch = true,
  columns = 2,
}: AchievementGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | "all"
  >("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedRarity, setSelectedRarity] = useState<
    AchievementRarity | "all"
  >("all");

  // Filter and search achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          achievement.name.toLowerCase().includes(query) ||
          achievement.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (
        selectedCategory !== "all" &&
        achievement.category !== selectedCategory
      ) {
        return false;
      }

      // Rarity filter
      if (selectedRarity !== "all" && achievement.rarity !== selectedRarity) {
        return false;
      }

      // Status filter
      switch (filterType) {
        case "unlocked":
          return achievement.isUnlocked;
        case "locked":
          return (
            !achievement.isUnlocked && achievement.progressPercentage === 0
          );
        case "in-progress":
          return !achievement.isUnlocked && achievement.progressPercentage > 0;
        default:
          return true;
      }
    });
  }, [achievements, searchQuery, selectedCategory, filterType, selectedRarity]);

  // Group achievements by category
  const groupedAchievements = useMemo(() => {
    const groups: Record<AchievementCategory, AchievementProgress[]> = {
      pomodoros: [],
      streaks: [],
      tasks: [],
      time: [],
      social: [],
      special: [],
    };

    filteredAchievements.forEach((achievement) => {
      groups[achievement.category].push(achievement);
    });

    return groups;
  }, [filteredAchievements]);

  // Stats
  const stats = useMemo(() => {
    const unlocked = achievements.filter((a) => a.isUnlocked).length;
    const total = achievements.length;
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = achievements
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return { unlocked, total, totalPoints, earnedPoints };
  }, [achievements]);

  const categories = Object.keys(CATEGORY_CONFIG) as AchievementCategory[];

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Trophy className="h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              {stats.unlocked} of {stats.total} unlocked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.earnedPoints}
            </div>
            <div className="text-xs text-muted-foreground">Points Earned</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {stats.totalPoints}
            </div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {(
                    ["all", "unlocked", "in-progress", "locked"] as FilterType[]
                  ).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className="capitalize"
                    >
                      {type.replace("-", " ")}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rarity Filter */}
              <div className="flex gap-1">
                <Button
                  variant={selectedRarity === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRarity("all")}
                >
                  All Rarities
                </Button>
                {(Object.keys(RARITY_CONFIG) as AchievementRarity[]).map(
                  (rarity) => (
                    <Button
                      key={rarity}
                      variant={
                        selectedRarity === rarity ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedRarity(rarity)}
                      className={cn(
                        selectedRarity === rarity &&
                          RARITY_CONFIG[rarity].textColor,
                      )}
                    >
                      {RARITY_CONFIG[rarity].label}
                    </Button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <Tabs
            value={selectedCategory}
            onValueChange={(v) =>
              setSelectedCategory(v as AchievementCategory | "all")
            }
          >
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                All
                <Badge variant="secondary" className="ml-1 text-xs">
                  {achievements.length}
                </Badge>
              </TabsTrigger>
              {categories.map((category) => {
                const config = CATEGORY_CONFIG[category];
                const count = achievements.filter(
                  (a) => a.category === category,
                ).length;
                return (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="gap-1"
                  >
                    <span>{config.icon}</span>
                    {config.label}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Achievement Grid */}
      {selectedCategory === "all" ? (
        // Show all categories with headers
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryAchievements = groupedAchievements[category];
            if (categoryAchievements.length === 0) return null;

            const config = CATEGORY_CONFIG[category];
            const unlockedCount = categoryAchievements.filter(
              (a) => a.isUnlocked,
            ).length;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className="text-lg font-semibold">{config.label}</h3>
                    <Badge variant="outline">
                      {unlockedCount}/{categoryAchievements.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>

                {/* Achievements */}
                <div className={cn("grid gap-4", columnClasses[columns])}>
                  <AnimatePresence mode="popLayout">
                    {categoryAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.achievementId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AchievementCard achievement={achievement} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Show single category
        <div className={cn("grid gap-4", columnClasses[columns])}>
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.achievementId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <AchievementCard achievement={achievement} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No achievements found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Keep going to unlock achievements!"}
          </p>
          {(searchQuery ||
            filterType !== "all" ||
            selectedCategory !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
                setSelectedCategory("all");
                setSelectedRarity("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}

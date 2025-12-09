// Achievement-related types

export type AchievementCategory =
  | "pomodoros"
  | "streaks"
  | "tasks"
  | "time"
  | "social"
  | "special";

export type AchievementRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary";

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  rarity: AchievementRarity;
  points: number;
  isHidden: boolean;
  order: number;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  userId: string;
  unlockedAt: string;
  progress: number;
  isCompleted: boolean;
  achievement: Achievement;
}

export interface AchievementProgress {
  achievementId: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercentage: number;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  categoryBreakdown: {
    category: AchievementCategory;
    total: number;
    unlocked: number;
  }[];
  recentUnlocks: UserAchievement[];
}

// Achievement notification for when user unlocks an achievement
export interface AchievementUnlock {
  achievement: Achievement;
  isNew: boolean;
  timestamp: string;
}

// For displaying achievements grouped by category
export interface AchievementGroup {
  category: AchievementCategory;
  categoryLabel: string;
  categoryIcon: string;
  achievements: AchievementProgress[];
}

// Rarity colors and styling
export const RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  common: {
    label: "Common",
    color: "#6B7280",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-300 dark:border-gray-600",
    textColor: "text-gray-600 dark:text-gray-400",
  },
  rare: {
    label: "Rare",
    color: "#3B82F6",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  epic: {
    label: "Epic",
    color: "#8B5CF6",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  legendary: {
    label: "Legendary",
    color: "#F59E0B",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    textColor: "text-amber-600 dark:text-amber-400",
  },
};

// Category display configuration
export const CATEGORY_CONFIG: Record<AchievementCategory, {
  label: string;
  icon: string;
  description: string;
}> = {
  pomodoros: {
    label: "Pomodoros",
    icon: "🍅",
    description: "Complete pomodoro sessions",
  },
  streaks: {
    label: "Streaks",
    icon: "🔥",
    description: "Maintain daily streaks",
  },
  tasks: {
    label: "Tasks",
    icon: "✅",
    description: "Complete tasks",
  },
  time: {
    label: "Focus Time",
    icon: "⏱️",
    description: "Accumulate focus time",
  },
  social: {
    label: "Social",
    icon: "👥",
    description: "Connect with others",
  },
  special: {
    label: "Special",
    icon: "⭐",
    description: "Unique achievements",
  },
};

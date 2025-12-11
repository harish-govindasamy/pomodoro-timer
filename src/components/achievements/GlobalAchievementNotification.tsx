"use client";

import { useAchievementStore } from "@/store/achievementStore";
import { AchievementUnlockNotification } from "./AchievementUnlockNotification";
import {
  Achievement,
  AchievementRarity,
  AchievementCategory,
} from "@/types/achievement";

/**
 * Wrapper component that connects the Zustand achievement store
 * to the AchievementUnlockNotification component.
 *
 * This should be rendered once in the app layout to handle
 * all achievement notifications globally.
 */
export function GlobalAchievementNotification() {
  const { currentNotification, isNotificationVisible, dismissNotification } =
    useAchievementStore();

  // Convert store notification to Achievement type expected by the component
  const achievement: Achievement | null = currentNotification
    ? {
        id: currentNotification.id,
        code: currentNotification.code,
        name: currentNotification.name,
        description: currentNotification.description,
        icon: currentNotification.icon,
        rarity: currentNotification.rarity as AchievementRarity,
        points: currentNotification.points,
        category: currentNotification.category as AchievementCategory,
        requirement: 1, // Not displayed in notification
        isHidden: false,
        order: 0,
      }
    : null;

  return (
    <AchievementUnlockNotification
      achievement={achievement}
      isOpen={isNotificationVisible}
      onClose={dismissNotification}
      autoCloseDelay={5000}
    />
  );
}

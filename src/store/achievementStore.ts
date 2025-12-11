import { create } from "zustand";

export interface AchievementNotification {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  points: number;
  category: string;
}

interface AchievementState {
  // Newly unlocked achievements waiting to be shown
  pendingNotifications: AchievementNotification[];
  // Currently showing notification
  currentNotification: AchievementNotification | null;
  // Whether the notification is visible
  isNotificationVisible: boolean;

  // Actions
  addPendingAchievements: (achievements: AchievementNotification[]) => void;
  showNextNotification: () => void;
  dismissNotification: () => void;
  clearAll: () => void;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  pendingNotifications: [],
  currentNotification: null,
  isNotificationVisible: false,

  addPendingAchievements: (achievements) => {
    if (achievements.length === 0) return;

    set((state) => ({
      pendingNotifications: [...state.pendingNotifications, ...achievements],
    }));

    // Auto-show the first notification if none is currently showing
    const { currentNotification } = get();
    if (!currentNotification) {
      get().showNextNotification();
    }
  },

  showNextNotification: () => {
    const { pendingNotifications } = get();
    if (pendingNotifications.length === 0) {
      set({ currentNotification: null, isNotificationVisible: false });
      return;
    }

    const [next, ...remaining] = pendingNotifications;
    set({
      currentNotification: next,
      pendingNotifications: remaining,
      isNotificationVisible: true,
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      get().dismissNotification();
    }, 5000);
  },

  dismissNotification: () => {
    set({ isNotificationVisible: false });

    // Show next notification after a brief delay
    setTimeout(() => {
      const { pendingNotifications } = get();
      if (pendingNotifications.length > 0) {
        get().showNextNotification();
      } else {
        set({ currentNotification: null });
      }
    }, 300);
  },

  clearAll: () => {
    set({
      pendingNotifications: [],
      currentNotification: null,
      isNotificationVisible: false,
    });
  },
}));

// Helper function to check achievements after an action
export async function checkAchievements(
  type: "session_complete" | "task_complete" | "streak_update",
): Promise<AchievementNotification[]> {
  try {
    const response = await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      console.error("Failed to check achievements");
      return [];
    }

    const data = await response.json();
    return data.newlyUnlocked || [];
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

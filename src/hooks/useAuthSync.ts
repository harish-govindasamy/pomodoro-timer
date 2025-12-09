"use client";

import { useEffect, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useTaskStore } from "@/store/taskStore";
import { useStatsStore } from "@/store/statsStore";
import {
  initializeSync,
  processSyncQueue,
  onSyncStatusChange,
  SyncStatus,
} from "@/lib/sync";

interface UseAuthSyncOptions {
  syncOnMount?: boolean;
  listenToStatusChanges?: boolean;
}

interface UseAuthSyncReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
}

export function useAuthSync(
  options: UseAuthSyncOptions = {},
): UseAuthSyncReturn {
  const { syncOnMount = true, listenToStatusChanges = true } = options;
  const { data: session, status } = useSession();

  const setTasksAuthenticated = useTaskStore((state) => state.setAuthenticated);
  const syncTasksFromServer = useTaskStore((state) => state.syncFromServer);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadStats = useStatsStore((state) => state.loadStats);

  // Track sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Initialize sync service on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeSync();
    }
  }, []);

  // Listen to sync status changes
  useEffect(() => {
    if (!listenToStatusChanges) return;

    const unsubscribe = onSyncStatusChange((newStatus, message) => {
      setSyncStatus(newStatus);
      if (message) {
        console.log(`Sync status: ${newStatus} - ${message}`);
      }
    });

    return unsubscribe;
  }, [listenToStatusChanges]);

  // Update store authentication state when session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setTasksAuthenticated(true);
    } else if (status === "unauthenticated") {
      setTasksAuthenticated(false);
    }
  }, [status, session, setTasksAuthenticated]);

  // Load local data on mount
  useEffect(() => {
    loadTasks();
    loadStats();
  }, [loadTasks, loadStats]);

  // Sync from server when authenticated
  useEffect(() => {
    if (syncOnMount && status === "authenticated" && session?.user) {
      syncTasksFromServer();
    }
  }, [syncOnMount, status, session, syncTasksFromServer]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (status !== "authenticated") return;

    setSyncStatus("syncing");

    try {
      // Process any pending items in the sync queue
      await processSyncQueue();

      // Sync tasks from server
      await syncTasksFromServer();

      setSyncStatus("synced");
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus("error");
    }
  }, [status, syncTasksFromServer]);

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    syncStatus,
    triggerSync,
  };
}

/**
 * Hook to check achievements after certain actions
 */
export function useAchievementCheck() {
  const { data: session } = useSession();

  const checkAchievements = useCallback(
    async (type: "pomodoro" | "task" | "streak") => {
      if (!session?.user) return null;

      try {
        const response = await fetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type }),
        });

        if (response.ok) {
          const { newlyUnlocked } = await response.json();
          return newlyUnlocked || [];
        }
      } catch (error) {
        console.error("Failed to check achievements:", error);
      }

      return null;
    },
    [session],
  );

  return { checkAchievements };
}

/**
 * Hook to record pomodoro sessions
 */
export function useSessionRecorder() {
  const { data: session } = useSession();

  const recordSession = useCallback(
    async (
      mode: "focus" | "shortBreak" | "longBreak",
      durationSeconds: number,
      taskId?: string,
    ) => {
      if (!session?.user) {
        // For unauthenticated users, just update local stats
        return { success: true, local: true };
      }

      try {
        // Create the session
        const createResponse = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            taskId,
            mode,
            plannedDuration: durationSeconds,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create session");
        }

        const { session: pomodoroSession } = await createResponse.json();

        // Complete the session
        const completeResponse = await fetch("/api/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: pomodoroSession.id,
            actualDuration: durationSeconds,
            status: "completed",
          }),
        });

        if (!completeResponse.ok) {
          throw new Error("Failed to complete session");
        }

        return { success: true, session: pomodoroSession };
      } catch (error) {
        console.error("Failed to record session:", error);
        return { success: false, error };
      }
    },
    [session],
  );

  return { recordSession };
}

/**
 * Hook to manage user streak
 */
export function useStreak() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState<{
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/stats?type=streak", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, isLoading, refetch: fetchStreak };
}

export default useAuthSync;

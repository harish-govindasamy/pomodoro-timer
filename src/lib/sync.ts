/**
 * Data Sync Service
 * Bridges localStorage (offline) with database API (online)
 * Provides hybrid offline/online support with automatic sync
 */

import { Task, Settings, DailyStats } from "@/types";

// API endpoints
const API_BASE = "/api";
const ENDPOINTS = {
  tasks: `${API_BASE}/tasks`,
  sessions: `${API_BASE}/sessions`,
  stats: `${API_BASE}/stats`,
  user: `${API_BASE}/user`,
};

// Sync status
export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

// Sync queue item
interface SyncQueueItem {
  id: string;
  type: "task" | "session" | "stats" | "settings";
  action: "create" | "update" | "delete";
  data: unknown;
  timestamp: number;
  retries: number;
}

// Storage keys
const SYNC_QUEUE_KEY = "pomofocus_sync_queue";
const LAST_SYNC_KEY = "pomofocus_last_sync";
const SYNC_STATUS_KEY = "pomofocus_sync_status";

// Event emitter for sync status changes
type SyncEventCallback = (status: SyncStatus, message?: string) => void;
const syncListeners: Set<SyncEventCallback> = new Set();

/**
 * Subscribe to sync status changes
 */
export function onSyncStatusChange(callback: SyncEventCallback): () => void {
  syncListeners.add(callback);
  return () => syncListeners.delete(callback);
}

/**
 * Emit sync status change
 */
function emitSyncStatus(status: SyncStatus, message?: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      SYNC_STATUS_KEY,
      JSON.stringify({ status, message, timestamp: Date.now() })
    );
  }
  syncListeners.forEach((callback) => callback(status, message));
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return false;
  return navigator.onLine;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch(`${ENDPOINTS.user}?settings=false`, {
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get sync queue from localStorage
 */
function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save sync queue to localStorage
 */
function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Add item to sync queue
 */
export function queueSync(
  type: SyncQueueItem["type"],
  action: SyncQueueItem["action"],
  data: unknown
): void {
  const queue = getSyncQueue();

  // Generate unique ID for this sync item
  const id = `${type}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Check for duplicate updates (same type and data ID)
  const dataId = (data as { id?: string })?.id;
  if (dataId && action === "update") {
    const existingIndex = queue.findIndex(
      (item) =>
        item.type === type &&
        item.action === "update" &&
        (item.data as { id?: string })?.id === dataId
    );

    if (existingIndex !== -1) {
      // Replace existing update with newer data
      queue[existingIndex] = {
        id,
        type,
        action,
        data,
        timestamp: Date.now(),
        retries: 0,
      };
      saveSyncQueue(queue);
      return;
    }
  }

  // Add new item to queue
  queue.push({
    id,
    type,
    action,
    data,
    timestamp: Date.now(),
    retries: 0,
  });

  saveSyncQueue(queue);

  // Try to sync immediately if online
  if (isOnline()) {
    processSyncQueue();
  }
}

/**
 * Process sync queue
 */
export async function processSyncQueue(): Promise<void> {
  if (!isOnline()) {
    emitSyncStatus("offline");
    return;
  }

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    // User not logged in, keep data in localStorage only
    return;
  }

  const queue = getSyncQueue();
  if (queue.length === 0) {
    emitSyncStatus("synced");
    return;
  }

  emitSyncStatus("syncing", `Syncing ${queue.length} items...`);

  const failedItems: SyncQueueItem[] = [];
  const maxRetries = 3;

  for (const item of queue) {
    try {
      await processQueueItem(item);
    } catch (error) {
      console.error(`Failed to sync ${item.type}:`, error);

      if (item.retries < maxRetries) {
        failedItems.push({ ...item, retries: item.retries + 1 });
      } else {
        console.error(`Max retries reached for ${item.id}, dropping item`);
      }
    }
  }

  saveSyncQueue(failedItems);

  if (failedItems.length === 0) {
    emitSyncStatus("synced");
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }
  } else {
    emitSyncStatus("error", `${failedItems.length} items failed to sync`);
  }
}

/**
 * Process a single queue item
 */
async function processQueueItem(item: SyncQueueItem): Promise<void> {
  const endpoint = getEndpointForType(item.type);

  switch (item.action) {
    case "create":
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(item.data),
      }).then(handleResponse);
      break;

    case "update":
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(item.data),
      }).then(handleResponse);
      break;

    case "delete":
      const id = (item.data as { id: string }).id;
      await fetch(`${endpoint}?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(handleResponse);
      break;
  }
}

/**
 * Get API endpoint for sync type
 */
function getEndpointForType(type: SyncQueueItem["type"]): string {
  switch (type) {
    case "task":
      return ENDPOINTS.tasks;
    case "session":
      return ENDPOINTS.sessions;
    case "stats":
      return ENDPOINTS.stats;
    case "settings":
      return `${ENDPOINTS.user}`;
    default:
      throw new Error(`Unknown sync type: ${type}`);
  }
}

/**
 * Handle API response
 */
async function handleResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Sync all data from server to local
 */
export async function syncFromServer(): Promise<{
  tasks?: Task[];
  settings?: Settings;
  stats?: DailyStats;
}> {
  if (!isOnline()) {
    throw new Error("Cannot sync while offline");
  }

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    throw new Error("User not authenticated");
  }

  emitSyncStatus("syncing", "Downloading data from server...");

  try {
    const [tasksRes, userRes, statsRes] = await Promise.all([
      fetch(ENDPOINTS.tasks, { credentials: "include" }),
      fetch(`${ENDPOINTS.user}?settings=true`, { credentials: "include" }),
      fetch(`${ENDPOINTS.stats}?type=summary&period=today`, {
        credentials: "include",
      }),
    ]);

    const results: {
      tasks?: Task[];
      settings?: Settings;
      stats?: DailyStats;
    } = {};

    if (tasksRes.ok) {
      const { tasks } = await tasksRes.json();
      results.tasks = tasks;
    }

    if (userRes.ok) {
      const { user } = await userRes.json();
      if (user.settings) {
        results.settings = {
          focusTime: user.settings.focusTime,
          shortBreakTime: user.settings.shortBreakTime,
          longBreakTime: user.settings.longBreakTime,
          longBreakAfter: user.settings.longBreakAfter,
          autoStartNextSession: user.settings.autoStartNextSession,
          autoStartBreak: user.settings.autoStartBreak,
          notificationAdvanceTime: user.settings.notificationAdvanceTime,
          alarmSound: user.settings.alarmSound,
          soundEnabled: user.settings.soundEnabled,
          notificationEnabled: user.settings.notificationEnabled,
          theme: user.settings.theme as "light" | "dark" | "auto",
        };
      }
    }

    if (statsRes.ok) {
      const { today } = await statsRes.json();
      if (today) {
        results.stats = {
          date: new Date().toISOString().split("T")[0],
          pomodorosCompleted: today.pomodorosCompleted,
          totalFocusTimeMinutes: today.totalFocusTimeMinutes,
          tasksCompleted: today.tasksCompleted,
        };
      }
    }

    emitSyncStatus("synced");
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }

    return results;
  } catch (error) {
    emitSyncStatus("error", "Failed to download data from server");
    throw error;
  }
}

/**
 * Sync all local data to server
 */
export async function syncToServer(data: {
  tasks?: Task[];
  settings?: Settings;
  stats?: DailyStats;
}): Promise<void> {
  if (!isOnline()) {
    throw new Error("Cannot sync while offline");
  }

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    throw new Error("User not authenticated");
  }

  emitSyncStatus("syncing", "Uploading data to server...");

  try {
    const promises: Promise<unknown>[] = [];

    // Sync tasks
    if (data.tasks) {
      for (const task of data.tasks) {
        promises.push(
          fetch(ENDPOINTS.tasks, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              title: task.title,
              estimatedPomodoros: task.estimatedPomodoros,
              completedPomodoros: task.completedPomodoros,
              color: task.color,
              isCompleted: task.isCompleted,
            }),
          })
        );
      }
    }

    // Sync settings
    if (data.settings) {
      promises.push(
        fetch(ENDPOINTS.user, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: "settings",
            data: data.settings,
          }),
        })
      );
    }

    // Sync stats
    if (data.stats) {
      promises.push(
        fetch(ENDPOINTS.stats, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data.stats),
        })
      );
    }

    await Promise.all(promises);

    emitSyncStatus("synced");
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }
  } catch (error) {
    emitSyncStatus("error", "Failed to upload data to server");
    throw error;
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LAST_SYNC_KEY);
  return stored ? parseInt(stored, 10) : null;
}

/**
 * Get current sync status
 */
export function getSyncStatus(): { status: SyncStatus; message?: string } {
  if (typeof window === "undefined") return { status: "idle" };

  try {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return { status: isOnline() ? "idle" : "offline" };
}

/**
 * Clear sync queue
 */
export function clearSyncQueue(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    emitSyncStatus("idle");
  }
}

/**
 * Initialize sync listeners
 */
export function initializeSync(): void {
  if (typeof window === "undefined") return;

  // Listen for online/offline events
  window.addEventListener("online", () => {
    emitSyncStatus("idle", "Back online");
    processSyncQueue();
  });

  window.addEventListener("offline", () => {
    emitSyncStatus("offline", "Working offline");
  });

  // Process any pending sync items on load
  if (isOnline()) {
    // Delay initial sync to allow app to load
    setTimeout(() => {
      processSyncQueue();
    }, 2000);
  } else {
    emitSyncStatus("offline");
  }
}

/**
 * Record a completed pomodoro session
 */
export async function recordSession(
  mode: "focus" | "shortBreak" | "longBreak",
  durationSeconds: number,
  taskId?: string
): Promise<void> {
  // Always save locally first
  const sessionData = {
    mode,
    plannedDuration: durationSeconds,
    actualDuration: durationSeconds,
    taskId,
    startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
    status: "completed",
  };

  // If online and authenticated, send directly to API
  if (isOnline() && (await isAuthenticated())) {
    try {
      // Create session
      const createRes = await fetch(ENDPOINTS.sessions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          taskId,
          mode,
          plannedDuration: durationSeconds,
        }),
      });

      if (createRes.ok) {
        const { session } = await createRes.json();

        // Complete session
        await fetch(ENDPOINTS.sessions, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: session.id,
            actualDuration: durationSeconds,
            status: "completed",
          }),
        });
      }
    } catch (error) {
      console.error("Failed to record session:", error);
      // Queue for later sync
      queueSync("session", "create", sessionData);
    }
  } else {
    // Queue for later sync
    queueSync("session", "create", sessionData);
  }
}

// Export types
export type { SyncQueueItem };

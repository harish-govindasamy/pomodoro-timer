import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  queueSync,
  clearSyncQueue,
  isOnline,
  getSyncStatus,
  onSyncStatusChange,
  getLastSyncTime,
} from "@/lib/sync";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("sync", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("isOnline", () => {
    it("should return true when navigator.onLine is true", () => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        writable: true,
      });

      expect(isOnline()).toBe(true);
    });

    it("should return false when navigator.onLine is false", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        writable: true,
      });

      expect(isOnline()).toBe(false);
    });
  });

  describe("queueSync", () => {
    it("should add item to sync queue", () => {
      queueSync("task", "create", { id: "task-1", title: "Test Task" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe("task");
      expect(queue[0].action).toBe("create");
      expect(queue[0].data).toEqual({ id: "task-1", title: "Test Task" });
    });

    it("should add multiple items to queue", () => {
      queueSync("task", "create", { id: "task-1", title: "Task 1" });
      queueSync("task", "create", { id: "task-2", title: "Task 2" });
      queueSync("session", "create", { id: "session-1", mode: "focus" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue).toHaveLength(3);
    });

    it("should deduplicate updates for same item", () => {
      queueSync("task", "update", { id: "task-1", title: "Title v1" });
      queueSync("task", "update", { id: "task-1", title: "Title v2" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      // Should have replaced the first update with the second
      expect(queue).toHaveLength(1);
      expect(queue[0].data.title).toBe("Title v2");
    });

    it("should not deduplicate different items", () => {
      queueSync("task", "update", { id: "task-1", title: "Title 1" });
      queueSync("task", "update", { id: "task-2", title: "Title 2" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue).toHaveLength(2);
    });

    it("should include timestamp and retries", () => {
      const before = Date.now();
      queueSync("task", "create", { id: "task-1" });
      const after = Date.now();

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(queue[0].timestamp).toBeLessThanOrEqual(after);
      expect(queue[0].retries).toBe(0);
    });
  });

  describe("clearSyncQueue", () => {
    it("should clear all items from queue", () => {
      queueSync("task", "create", { id: "task-1" });
      queueSync("task", "create", { id: "task-2" });

      clearSyncQueue();

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue).toHaveLength(0);
    });
  });

  describe("getSyncStatus", () => {
    it("should return idle when no status set and online", () => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        writable: true,
      });

      const status = getSyncStatus();
      expect(status.status).toBe("idle");
    });

    it("should return offline when navigator is offline", () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        writable: true,
      });

      // Clear any stored status
      localStorage.removeItem("pomofocus_sync_status");

      const status = getSyncStatus();
      expect(status.status).toBe("offline");
    });

    it("should return stored status", () => {
      localStorage.setItem(
        "pomofocus_sync_status",
        JSON.stringify({ status: "syncing", message: "In progress" }),
      );

      const status = getSyncStatus();
      expect(status.status).toBe("syncing");
      expect(status.message).toBe("In progress");
    });
  });

  describe("onSyncStatusChange", () => {
    it("should return unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = onSyncStatusChange(callback);

      expect(typeof unsubscribe).toBe("function");
    });

    // Note: Testing event emission requires integration with processSyncQueue
    // which makes network calls. These would be better as integration tests.
  });

  describe("getLastSyncTime", () => {
    it("should return null when no sync has occurred", () => {
      expect(getLastSyncTime()).toBeNull();
    });

    it("should return timestamp when sync has occurred", () => {
      const timestamp = Date.now();
      localStorage.setItem("pomofocus_last_sync", timestamp.toString());

      expect(getLastSyncTime()).toBe(timestamp);
    });
  });

  describe("Queue Item Structure", () => {
    it("should generate unique IDs for queue items", () => {
      queueSync("task", "create", { id: "task-1" });
      queueSync("task", "create", { id: "task-2" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue[0].id).not.toBe(queue[1].id);
    });

    it("should support different action types", () => {
      queueSync("task", "create", { id: "task-1" });
      queueSync("task", "update", { id: "task-2" });
      queueSync("task", "delete", { id: "task-3" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      expect(queue.map((q: { action: string }) => q.action)).toEqual([
        "create",
        "update",
        "delete",
      ]);
    });

    it("should support different entity types", () => {
      queueSync("task", "create", { id: "1" });
      queueSync("session", "create", { id: "2" });
      queueSync("stats", "update", { id: "3" });
      queueSync("settings", "update", { id: "4" });

      const queue = JSON.parse(
        localStorage.getItem("pomofocus_sync_queue") || "[]",
      );
      const types = queue.map((q: { type: string }) => q.type);
      expect(types).toContain("task");
      expect(types).toContain("session");
      expect(types).toContain("stats");
      expect(types).toContain("settings");
    });
  });
});

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useTimerStore } from "@/store/timerStore";

// Helper to reset the store between tests
const resetStore = () => {
  const store = useTimerStore.getState();
  if (store.intervalId) {
    clearInterval(store.intervalId);
  }
  useTimerStore.setState({
    currentTime: 25 * 60,
    isRunning: false,
    mode: "focus",
    state: "idle",
    pomodorosCompleted: 0,
    selectedTaskId: null,
    intervalId: null,
    lastCompletedMode: null,
    startedAt: null,
    pausedTimeRemaining: null,
  });
};

describe("timerStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetStore();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useTimerStore.getState();

      expect(state.currentTime).toBe(25 * 60);
      expect(state.isRunning).toBe(false);
      expect(state.mode).toBe("focus");
      expect(state.state).toBe("idle");
      expect(state.pomodorosCompleted).toBe(0);
      expect(state.selectedTaskId).toBeNull();
    });
  });

  describe("startTimer", () => {
    it("should set isRunning to true", () => {
      const { startTimer } = useTimerStore.getState();

      startTimer();

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.state).toBe("running");
    });

    it("should set startedAt timestamp", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const { startTimer } = useTimerStore.getState();
      startTimer();

      const state = useTimerStore.getState();
      expect(state.startedAt).toBe(now);
    });

    it("should create an interval", () => {
      const { startTimer } = useTimerStore.getState();

      startTimer();

      const state = useTimerStore.getState();
      expect(state.intervalId).not.toBeNull();
    });
  });

  describe("pauseTimer", () => {
    it("should set isRunning to false", () => {
      const store = useTimerStore.getState();
      store.startTimer();
      store.pauseTimer();

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.state).toBe("paused");
    });

    it("should clear the interval", () => {
      const store = useTimerStore.getState();
      store.startTimer();
      const intervalId = useTimerStore.getState().intervalId;

      store.pauseTimer();

      const state = useTimerStore.getState();
      expect(state.intervalId).toBeNull();
    });

    it("should save pausedTimeRemaining", () => {
      const store = useTimerStore.getState();

      // Start with 25 minutes
      store.startTimer();

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);
      store.tick();

      store.pauseTimer();

      const state = useTimerStore.getState();
      expect(state.pausedTimeRemaining).toBeLessThanOrEqual(25 * 60);
    });
  });

  describe("resetTimer", () => {
    it("should reset to initial duration", () => {
      const store = useTimerStore.getState();
      store.startTimer();

      // Advance some time
      vi.advanceTimersByTime(10000);
      store.tick();

      store.resetTimer();

      const state = useTimerStore.getState();
      expect(state.currentTime).toBe(25 * 60);
      expect(state.isRunning).toBe(false);
      expect(state.state).toBe("idle");
    });
  });

  describe("setMode", () => {
    it("should change mode to shortBreak", () => {
      const { setMode } = useTimerStore.getState();

      setMode("shortBreak");

      const state = useTimerStore.getState();
      expect(state.mode).toBe("shortBreak");
      expect(state.currentTime).toBe(5 * 60);
    });

    it("should change mode to longBreak", () => {
      const { setMode } = useTimerStore.getState();

      setMode("longBreak");

      const state = useTimerStore.getState();
      expect(state.mode).toBe("longBreak");
      expect(state.currentTime).toBe(15 * 60);
    });

    it("should stop running timer when mode changes", () => {
      const store = useTimerStore.getState();
      store.startTimer();

      expect(useTimerStore.getState().isRunning).toBe(true);

      store.setMode("shortBreak");

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
    });
  });

  describe("skipTimer", () => {
    it("should switch from focus to shortBreak", () => {
      const { skipTimer } = useTimerStore.getState();

      skipTimer();

      const state = useTimerStore.getState();
      expect(state.mode).toBe("shortBreak");
    });

    it("should switch from shortBreak to focus", () => {
      const store = useTimerStore.getState();
      store.setMode("shortBreak");

      store.skipTimer();

      const state = useTimerStore.getState();
      expect(state.mode).toBe("focus");
    });
  });

  describe("tick", () => {
    it("should decrease currentTime based on elapsed time", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const store = useTimerStore.getState();
      store.startTimer();

      // Advance time by 10 seconds
      vi.setSystemTime(now + 10000);
      store.tick();

      const state = useTimerStore.getState();
      expect(state.currentTime).toBe(25 * 60 - 10);
    });

    it("should trigger completeSession when time runs out", () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const store = useTimerStore.getState();
      // Set up a short duration to test (5 seconds)
      useTimerStore.setState({
        currentTime: 5,
        mode: "focus",
      });
      store.startTimer();

      // Now startedAt should be set to 'now' and pausedTimeRemaining to 5
      // Advance time beyond the 5 second duration
      vi.setSystemTime(now + 10000); // 10 seconds later
      store.tick();

      const state = useTimerStore.getState();
      // After focus completes, it should switch to shortBreak
      expect(state.mode).toBe("shortBreak");
      expect(state.state).toBe("completed");
      expect(state.pomodorosCompleted).toBe(1);
    });
  });

  describe("setSelectedTaskId", () => {
    it("should set the selected task ID", () => {
      const { setSelectedTaskId } = useTimerStore.getState();

      setSelectedTaskId("task-123");

      const state = useTimerStore.getState();
      expect(state.selectedTaskId).toBe("task-123");
    });

    it("should allow null to deselect", () => {
      const store = useTimerStore.getState();
      store.setSelectedTaskId("task-123");
      store.setSelectedTaskId(null);

      const state = useTimerStore.getState();
      expect(state.selectedTaskId).toBeNull();
    });
  });

  describe("completeSession", () => {
    it("should increment pomodorosCompleted for focus sessions", () => {
      useTimerStore.setState({
        mode: "focus",
        pomodorosCompleted: 0,
      });

      const { completeSession } = useTimerStore.getState();
      completeSession();

      const state = useTimerStore.getState();
      expect(state.pomodorosCompleted).toBe(1);
    });

    it("should switch to shortBreak after focus", () => {
      useTimerStore.setState({
        mode: "focus",
        pomodorosCompleted: 0,
      });

      const { completeSession } = useTimerStore.getState();
      completeSession();

      const state = useTimerStore.getState();
      expect(state.mode).toBe("shortBreak");
    });

    it("should switch to longBreak after 4 pomodoros", () => {
      useTimerStore.setState({
        mode: "focus",
        pomodorosCompleted: 3, // After completing this one, it will be 4
      });

      const { completeSession } = useTimerStore.getState();
      completeSession();

      const state = useTimerStore.getState();
      expect(state.pomodorosCompleted).toBe(4);
      expect(state.mode).toBe("longBreak");
    });

    it("should switch to focus after break", () => {
      useTimerStore.setState({
        mode: "shortBreak",
        pomodorosCompleted: 1,
      });

      const { completeSession } = useTimerStore.getState();
      completeSession();

      const state = useTimerStore.getState();
      expect(state.mode).toBe("focus");
      // Pomodoros should not increment for breaks
      expect(state.pomodorosCompleted).toBe(1);
    });

    it("should store lastCompletedMode", () => {
      useTimerStore.setState({
        mode: "focus",
        pomodorosCompleted: 0,
      });

      const { completeSession } = useTimerStore.getState();
      completeSession();

      const state = useTimerStore.getState();
      expect(state.lastCompletedMode).toBe("focus");
    });
  });

  describe("getDuration", () => {
    it("should return correct duration for focus", () => {
      useTimerStore.setState({ mode: "focus" });

      const { getDuration } = useTimerStore.getState();
      expect(getDuration()).toBe(25 * 60);
    });

    it("should return correct duration for shortBreak", () => {
      useTimerStore.setState({ mode: "shortBreak" });

      const { getDuration } = useTimerStore.getState();
      expect(getDuration()).toBe(5 * 60);
    });

    it("should return correct duration for longBreak", () => {
      useTimerStore.setState({ mode: "longBreak" });

      const { getDuration } = useTimerStore.getState();
      expect(getDuration()).toBe(15 * 60);
    });
  });
});

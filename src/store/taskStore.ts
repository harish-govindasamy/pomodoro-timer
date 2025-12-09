import { create } from "zustand";
import { Task } from "@/types";
import { loadTasks, saveTasks } from "@/utils/storage";
import { generateId } from "@/utils";
import { queueSync, isOnline } from "@/lib/sync";

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  isAuthenticated: boolean;
  isSyncing: boolean;

  // Actions
  loadTasks: () => void;
  setAuthenticated: (authenticated: boolean) => void;
  addTask: (
    title: string,
    estimatedPomodoros: number,
    color?: string,
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  editTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  selectTask: (taskId: string | null) => void;
  reorderTasks: (newOrder: Task[]) => void;
  incrementTaskPomodoro: (taskId: string) => Promise<void>;
  getSelectedTask: () => Task | null;
  getTaskStats: () => { total: number; completed: number; remaining: number };
  syncFromServer: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  isAuthenticated: false,
  isSyncing: false,

  loadTasks: () => {
    try {
      const tasks = loadTasks();
      set({ tasks });
    } catch (error) {
      console.error("Failed to load tasks:", error);
      set({ tasks: [] });
    }
  },

  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
    if (authenticated) {
      // Sync from server when authenticated
      get().syncFromServer();
    }
  },

  addTask: async (
    title: string,
    estimatedPomodoros: number,
    color?: string,
  ) => {
    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      color: color || "#3B82F6",
    };

    const { tasks, isAuthenticated } = get();
    const updatedTasks = [...tasks, newTask];
    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);

    // Sync with server if authenticated
    if (isAuthenticated && isOnline()) {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: newTask.title,
            estimatedPomodoros: newTask.estimatedPomodoros,
            color: newTask.color,
          }),
        });

        if (response.ok) {
          const { task: serverTask } = await response.json();
          // Update the task with server ID
          const tasksWithServerId = updatedTasks.map((t) =>
            t.id === newTask.id ? { ...t, serverId: serverTask.id } : t,
          );
          set({ tasks: tasksWithServerId });
          saveTasks(tasksWithServerId);
        }
      } catch (error) {
        console.error("Failed to sync task to server:", error);
        // Queue for later sync
        queueSync("task", "create", newTask);
      }
    } else if (isAuthenticated) {
      // Offline - queue for later
      queueSync("task", "create", newTask);
    }
  },

  deleteTask: async (taskId: string) => {
    const { tasks, selectedTaskId, isAuthenticated } = get();
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    const newSelectedTaskId = selectedTaskId === taskId ? null : selectedTaskId;

    set({
      tasks: updatedTasks,
      selectedTaskId: newSelectedTaskId,
    });
    saveTasks(updatedTasks);

    // Sync with server if authenticated
    if (isAuthenticated && taskToDelete && isOnline()) {
      try {
        await fetch(`/api/tasks?id=${taskId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to delete task from server:", error);
        queueSync("task", "delete", { id: taskId });
      }
    } else if (isAuthenticated && taskToDelete) {
      queueSync("task", "delete", { id: taskId });
    }
  },

  editTask: async (taskId: string, updates: Partial<Task>) => {
    const { tasks, isAuthenticated } = get();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task,
    );

    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);

    // Sync with server if authenticated
    if (isAuthenticated && isOnline()) {
      try {
        await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: taskId, ...updates }),
        });
      } catch (error) {
        console.error("Failed to update task on server:", error);
        queueSync("task", "update", { id: taskId, ...updates });
      }
    } else if (isAuthenticated) {
      queueSync("task", "update", { id: taskId, ...updates });
    }
  },

  toggleTaskCompletion: async (taskId: string) => {
    const { tasks, isAuthenticated } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isCompleted = !task.isCompleted;
    const updates = {
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
    };

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t,
    );

    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);

    // Sync with server if authenticated
    if (isAuthenticated && isOnline()) {
      try {
        await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: taskId, ...updates }),
        });
      } catch (error) {
        console.error("Failed to update task on server:", error);
        queueSync("task", "update", { id: taskId, ...updates });
      }
    } else if (isAuthenticated) {
      queueSync("task", "update", { id: taskId, ...updates });
    }
  },

  selectTask: (taskId: string | null) => {
    set({ selectedTaskId: taskId });
  },

  reorderTasks: (newOrder: Task[]) => {
    set({ tasks: newOrder });
    saveTasks(newOrder);
  },

  incrementTaskPomodoro: async (taskId: string) => {
    const { tasks, isAuthenticated } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updates = { completedPomodoros: task.completedPomodoros + 1 };
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t,
    );

    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);

    // Sync with server if authenticated
    if (isAuthenticated && isOnline()) {
      try {
        await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: taskId, ...updates }),
        });
      } catch (error) {
        console.error("Failed to update task on server:", error);
        queueSync("task", "update", { id: taskId, ...updates });
      }
    } else if (isAuthenticated) {
      queueSync("task", "update", { id: taskId, ...updates });
    }
  },

  getSelectedTask: () => {
    const { tasks, selectedTaskId } = get();
    return tasks.find((task) => task.id === selectedTaskId) || null;
  },

  getTaskStats: () => {
    const { tasks } = get();
    const total = tasks.length;
    const completed = tasks.filter((task) => task.isCompleted).length;
    const remaining = total - completed;

    return { total, completed, remaining };
  },

  syncFromServer: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated || !isOnline()) return;

    set({ isSyncing: true });

    try {
      const response = await fetch("/api/tasks", {
        credentials: "include",
      });

      if (response.ok) {
        const { tasks: serverTasks } = await response.json();

        // Merge server tasks with local tasks
        // Server tasks take precedence for authenticated users
        const mergedTasks: Task[] = serverTasks.map(
          (serverTask: {
            id: string;
            title: string;
            estimatedPomodoros: number;
            completedPomodoros: number;
            isCompleted: boolean;
            createdAt: string;
            completedAt: string | null;
            color: string | null;
          }) => ({
            id: serverTask.id,
            title: serverTask.title,
            estimatedPomodoros: serverTask.estimatedPomodoros,
            completedPomodoros: serverTask.completedPomodoros,
            isCompleted: serverTask.isCompleted,
            createdAt: serverTask.createdAt,
            completedAt: serverTask.completedAt,
            color: serverTask.color || "#3B82F6",
          }),
        );

        set({ tasks: mergedTasks });
        saveTasks(mergedTasks);
      }
    } catch (error) {
      console.error("Failed to sync tasks from server:", error);
    } finally {
      set({ isSyncing: false });
    }
  },
}));

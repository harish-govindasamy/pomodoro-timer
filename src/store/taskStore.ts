import { create } from "zustand";
import { Task } from "@/types";
import { loadTasks, saveTasks } from "@/utils/storage";
import { generateId } from "@/utils";

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;

  // Actions
  loadTasks: () => void;
  addTask: (title: string, estimatedPomodoros: number, color?: string) => void;
  deleteTask: (taskId: string) => void;
  editTask: (taskId: string, updates: Partial<Task>) => void;
  toggleTaskCompletion: (taskId: string) => void;
  selectTask: (taskId: string | null) => void;
  reorderTasks: (newOrder: Task[]) => void;
  incrementTaskPomodoro: (taskId: string) => void;
  getSelectedTask: () => Task | null;
  getTaskStats: () => { total: number; completed: number; remaining: number };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,

  loadTasks: () => {
    try {
      const tasks = loadTasks();
      set({ tasks });
    } catch (error) {
      console.error("Failed to load tasks:", error);
      set({ tasks: [] });
    }
  },

  addTask: (title: string, estimatedPomodoros: number, color?: string) => {
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

    const { tasks } = get();
    const updatedTasks = [...tasks, newTask];
    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);
  },

  deleteTask: (taskId: string) => {
    const { tasks, selectedTaskId } = get();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    const newSelectedTaskId = selectedTaskId === taskId ? null : selectedTaskId;

    set({
      tasks: updatedTasks,
      selectedTaskId: newSelectedTaskId,
    });
    saveTasks(updatedTasks);
  },

  editTask: (taskId: string, updates: Partial<Task>) => {
    const { tasks } = get();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);
  },

  toggleTaskCompletion: (taskId: string) => {
    const { tasks } = get();
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const isCompleted = !task.isCompleted;
        return {
          ...task,
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null,
        };
      }
      return task;
    });

    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);
  },

  selectTask: (taskId: string | null) => {
    set({ selectedTaskId: taskId });
  },

  reorderTasks: (newOrder: Task[]) => {
    set({ tasks: newOrder });
    saveTasks(newOrder);
  },

  incrementTaskPomodoro: (taskId: string) => {
    const { tasks } = get();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
        : task
    );

    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);
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
}));

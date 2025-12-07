import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useStatsStore } from "@/store/statsStore";
import { Task, TaskStats } from "@/types";
import { validateTaskTitle, validatePomodoroCount } from "@/utils";

export function useTasks() {
  const {
    tasks,
    selectedTaskId,
    loadTasks,
    addTask,
    deleteTask,
    editTask,
    toggleTaskCompletion,
    selectTask,
    reorderTasks,
    incrementTaskPomodoro,
    getSelectedTask,
    getTaskStats,
  } = useTaskStore();

  const { incrementTaskCompletion: incrementStatsTaskCompletion } =
    useStatsStore();

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const addNewTask = (
    title: string,
    estimatedPomodoros: number = 1,
    color?: string
  ) => {
    if (!validateTaskTitle(title)) {
      throw new Error(
        "Task title is required and must be less than 100 characters"
      );
    }

    if (!validatePomodoroCount(estimatedPomodoros)) {
      throw new Error("Estimated pomodoros must be between 1 and 10");
    }

    addTask(title, estimatedPomodoros, color);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (updates.title && !validateTaskTitle(updates.title)) {
      throw new Error(
        "Task title is required and must be less than 100 characters"
      );
    }

    if (
      updates.estimatedPomodoros &&
      !validatePomodoroCount(updates.estimatedPomodoros)
    ) {
      throw new Error("Estimated pomodoros must be between 1 and 10");
    }

    editTask(taskId, updates);
  };

  const removeTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const toggleComplete = (taskId: string) => {
    // Check if task is currently incomplete (about to be marked complete)
    const task = tasks.find((t) => t.id === taskId);
    const isBeingCompleted = task && !task.isCompleted;

    toggleTaskCompletion(taskId);

    // If task was just completed (not uncompleted), increment stats
    if (isBeingCompleted) {
      incrementStatsTaskCompletion();
    }
  };

  const selectActiveTask = (taskId: string | null) => {
    selectTask(taskId);
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find((task) => task.id === taskId);
  };

  const getActiveTasks = (): Task[] => {
    return tasks.filter((task) => !task.isCompleted);
  };

  const getCompletedTasks = (): Task[] => {
    return tasks.filter((task) => task.isCompleted);
  };

  const getTaskProgress = (task: Task): number => {
    if (task.estimatedPomodoros === 0) return 0;
    return Math.min(
      (task.completedPomodoros / task.estimatedPomodoros) * 100,
      100
    );
  };

  const getDetailedStats = (): TaskStats & {
    totalEstimated: number;
    totalCompleted: number;
  } => {
    const stats = getTaskStats();
    const totalEstimated = tasks.reduce(
      (sum, task) => sum + task.estimatedPomodoros,
      0
    );
    const totalCompleted = tasks.reduce(
      (sum, task) => sum + task.completedPomodoros,
      0
    );

    return {
      ...stats,
      totalEstimated,
      totalCompleted,
    };
  };

  const moveTaskUp = (taskId: string) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index - 1], newTasks[index]] = [
        newTasks[index],
        newTasks[index - 1],
      ];
      reorderTasks(newTasks);
    }
  };

  const moveTaskDown = (taskId: string) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [
        newTasks[index + 1],
        newTasks[index],
      ];
      reorderTasks(newTasks);
    }
  };

  return {
    // State
    tasks,
    selectedTaskId,
    selectedTask: getSelectedTask(),

    // Computed
    activeTasks: getActiveTasks(),
    completedTasks: getCompletedTasks(),
    stats: getDetailedStats(),

    // Actions
    addTask: addNewTask,
    updateTask,
    removeTask,
    toggleComplete,
    selectTask: selectActiveTask,
    incrementTaskPomodoro,

    // Helpers
    getTaskById,
    getTaskProgress,
    moveTaskUp,
    moveTaskDown,
  };
}

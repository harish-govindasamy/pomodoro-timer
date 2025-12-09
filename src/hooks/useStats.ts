import { useEffect } from "react";
import { useStatsStore } from "@/store/statsStore";
import { DailyStats } from "@/types";
import { getTodayDateString } from "@/utils";

export function useStats() {
  const {
    today,
    history,
    loadStats,
    incrementPomodoro,
    updateFocusTime,
    incrementTaskCompletion,
    addDayToHistory,
    getStatsForDate,
    getWeeklyStats,
    getMonthlyStats,
  } = useStatsStore();

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const getTotalPomodoros = (): number => {
    return today.pomodorosCompleted;
  };

  const getTotalFocusTime = (): number => {
    return today.totalFocusTimeMinutes;
  };

  const getTotalTasksCompleted = (): number => {
    return today.tasksCompleted;
  };

  const getAverageFocusTime = (): number => {
    if (today.pomodorosCompleted === 0) return 0;
    return Math.round(today.totalFocusTimeMinutes / today.pomodorosCompleted);
  };

  const getWeeklyPomodoros = (): number => {
    const weeklyStats = getWeeklyStats();
    return weeklyStats.reduce((sum, day) => sum + day.pomodorosCompleted, 0);
  };

  const getWeeklyFocusTime = (): number => {
    const weeklyStats = getWeeklyStats();
    return weeklyStats.reduce((sum, day) => sum + day.totalFocusTimeMinutes, 0);
  };

  const getMonthlyPomodoros = (): number => {
    const monthlyStats = getMonthlyStats();
    return monthlyStats.reduce((sum, day) => sum + day.pomodorosCompleted, 0);
  };

  const getMonthlyFocusTime = (): number => {
    const monthlyStats = getMonthlyStats();
    return monthlyStats.reduce(
      (sum, day) => sum + day.totalFocusTimeMinutes,
      0
    );
  };

  const getEstimatedFinishTime = (remainingPomodoros: number): string => {
    if (remainingPomodoros === 0) return "All done!";

    const averageTime = getAverageFocusTime();
    const totalMinutes = remainingPomodoros * averageTime;
    const now = new Date();
    const finishTime = new Date(now.getTime() + totalMinutes * 60 * 1000);

    return finishTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTodayProgress = (): {
    pomodoroProgress: number;
    timeProgress: number;
    taskProgress: number;
  } => {
    // Daily goals (you can make these configurable)
    const dailyPomodoroGoal = 8;
    const dailyTimeGoal = 200; // minutes
    const dailyTaskGoal = 5;

    return {
      pomodoroProgress: Math.min(
        Math.max((today.pomodorosCompleted / dailyPomodoroGoal) * 100, 0),
        100
      ),
      timeProgress: Math.min(
        Math.max((today.totalFocusTimeMinutes / dailyTimeGoal) * 100, 0),
        100
      ),
      taskProgress: Math.min(
        Math.max((today.tasksCompleted / dailyTaskGoal) * 100, 0),
        100
      ),
    };
  };

  const getStreak = (): number => {
    const allStats = [today, ...history];
    if (allStats.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date(today.date + "T00:00:00Z");

    for (let i = 0; i < allStats.length; i++) {
      const stat = allStats[i];
      const statDate = new Date(stat.date + "T00:00:00Z");

      // Check if current stat date matches expected date (going backwards)
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);

      const statDateStr = statDate.toISOString().split("T")[0];
      const expectedDateStr = expectedDate.toISOString().split("T")[0];

      if (statDateStr === expectedDateStr && stat.pomodorosCompleted > 0) {
        streak++;
      } else if (stat.pomodorosCompleted === 0) {
        // Can skip days with 0 pomodoros
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  const getBestDay = (): DailyStats | null => {
    const allStats = [today, ...history];
    if (allStats.length === 0) return null;

    return allStats.reduce((best, current) =>
      current.pomodorosCompleted > best.pomodorosCompleted ? current : best
    );
  };

  const exportStats = () => {
    const data = {
      today,
      history,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pomofocus-stats-${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    // State
    today,
    history,

    // Today's stats
    totalPomodoros: getTotalPomodoros(),
    totalFocusTime: getTotalFocusTime(),
    totalTasksCompleted: getTotalTasksCompleted(),
    averageFocusTime: getAverageFocusTime(),

    // Weekly stats
    weeklyPomodoros: getWeeklyPomodoros(),
    weeklyFocusTime: getWeeklyFocusTime(),

    // Monthly stats
    monthlyPomodoros: getMonthlyPomodoros(),
    monthlyFocusTime: getMonthlyFocusTime(),

    // Progress and achievements
    progress: getTodayProgress(),
    streak: getStreak(),
    bestDay: getBestDay(),

    // Helpers
    estimatedFinishTime: getEstimatedFinishTime,
    getStatsForDate,
    getWeeklyStats,
    getMonthlyStats,

    // Actions
    incrementPomodoro,
    updateFocusTime,
    incrementTaskCompletion,
    addDayToHistory,
    exportStats,
  };
}

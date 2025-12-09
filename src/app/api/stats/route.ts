import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Helper to get date string
function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

// Helper to get date range for different periods
function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  const today = getDateString(now);

  switch (period) {
    case "today":
      return { start: today, end: today };

    case "week": {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return { start: getDateString(startOfWeek), end: today };
    }

    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: getDateString(startOfMonth), end: today };
    }

    case "year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { start: getDateString(startOfYear), end: today };
    }

    case "all":
    default:
      return { start: "2000-01-01", end: today };
  }
}

// GET /api/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "summary";
    const period = searchParams.get("period") ?? "week";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Determine date range
    let dateRange: { start: string; end: string };
    if (startDate && endDate) {
      dateRange = { start: startDate, end: endDate };
    } else {
      dateRange = getDateRange(period);
    }

    switch (type) {
      case "summary":
        return await getSummaryStats(session.user.id, dateRange);

      case "daily":
        return await getDailyStats(session.user.id, dateRange);

      case "heatmap":
        return await getHeatmapData(session.user.id, dateRange);

      case "streak":
        return await getStreakStats(session.user.id);

      case "achievements":
        return await getAchievementStats(session.user.id);

      case "productivity":
        return await getProductivityInsights(session.user.id, dateRange);

      case "leaderboard":
        return await getLeaderboard(period);

      default:
        return NextResponse.json(
          { error: "Invalid stats type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// Summary statistics
async function getSummaryStats(
  userId: string,
  dateRange: { start: string; end: string }
) {
  const today = getDateString();

  const [dailyStats, todayStats, streak, totalTasks, activeTasks] =
    await Promise.all([
      // Aggregated stats for the period
      prisma.dailyStats.aggregate({
        where: {
          userId,
          date: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        _sum: {
          pomodorosCompleted: true,
          totalFocusTimeMinutes: true,
          tasksCompleted: true,
          focusSessions: true,
          shortBreaks: true,
          longBreaks: true,
        },
        _avg: {
          pomodorosCompleted: true,
          totalFocusTimeMinutes: true,
        },
        _max: {
          pomodorosCompleted: true,
          totalFocusTimeMinutes: true,
        },
      }),

      // Today's stats
      prisma.dailyStats.findUnique({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
      }),

      // Streak info
      prisma.streak.findUnique({
        where: { userId },
      }),

      // Total completed tasks
      prisma.task.count({
        where: { userId, isCompleted: true },
      }),

      // Active tasks
      prisma.task.count({
        where: { userId, isCompleted: false, isArchived: false },
      }),
    ]);

  return NextResponse.json({
    period: dateRange,
    today: {
      pomodorosCompleted: todayStats?.pomodorosCompleted ?? 0,
      totalFocusTimeMinutes: todayStats?.totalFocusTimeMinutes ?? 0,
      tasksCompleted: todayStats?.tasksCompleted ?? 0,
    },
    periodTotal: {
      pomodorosCompleted: dailyStats._sum.pomodorosCompleted ?? 0,
      totalFocusTimeMinutes: dailyStats._sum.totalFocusTimeMinutes ?? 0,
      totalFocusTimeHours: Math.round(
        (dailyStats._sum.totalFocusTimeMinutes ?? 0) / 60 * 10
      ) / 10,
      tasksCompleted: dailyStats._sum.tasksCompleted ?? 0,
      focusSessions: dailyStats._sum.focusSessions ?? 0,
      shortBreaks: dailyStats._sum.shortBreaks ?? 0,
      longBreaks: dailyStats._sum.longBreaks ?? 0,
    },
    periodAverage: {
      pomodorosPerDay: Math.round((dailyStats._avg.pomodorosCompleted ?? 0) * 10) / 10,
      focusMinutesPerDay: Math.round((dailyStats._avg.totalFocusTimeMinutes ?? 0) * 10) / 10,
    },
    periodBest: {
      mostPomodoros: dailyStats._max.pomodorosCompleted ?? 0,
      mostFocusMinutes: dailyStats._max.totalFocusTimeMinutes ?? 0,
    },
    streak: {
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
      lastActiveDate: streak?.lastActiveDate,
    },
    tasks: {
      completed: totalTasks,
      active: activeTasks,
    },
  });
}

// Daily stats for charts
async function getDailyStats(
  userId: string,
  dateRange: { start: string; end: string }
) {
  const stats = await prisma.dailyStats.findMany({
    where: {
      userId,
      date: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      pomodorosCompleted: true,
      totalFocusTimeMinutes: true,
      tasksCompleted: true,
      focusSessions: true,
      dailyGoalMet: true,
    },
  });

  // Fill in missing dates with zeros
  const filledStats: Array<{
    date: string;
    pomodorosCompleted: number;
    totalFocusTimeMinutes: number;
    tasksCompleted: number;
    focusSessions: number;
    dailyGoalMet: boolean;
  }> = [];

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const statsMap = new Map(stats.map((s) => [s.date, s]));

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = getDateString(d);
    const stat = statsMap.get(dateStr);

    filledStats.push({
      date: dateStr,
      pomodorosCompleted: stat?.pomodorosCompleted ?? 0,
      totalFocusTimeMinutes: stat?.totalFocusTimeMinutes ?? 0,
      tasksCompleted: stat?.tasksCompleted ?? 0,
      focusSessions: stat?.focusSessions ?? 0,
      dailyGoalMet: stat?.dailyGoalMet ?? false,
    });
  }

  return NextResponse.json({ stats: filledStats });
}

// Heatmap data (GitHub-style activity visualization)
async function getHeatmapData(
  userId: string,
  dateRange: { start: string; end: string }
) {
  const stats = await prisma.dailyStats.findMany({
    where: {
      userId,
      date: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: {
      date: true,
      pomodorosCompleted: true,
      totalFocusTimeMinutes: true,
    },
  });

  // Transform to heatmap format
  const heatmapData = stats.map((stat) => ({
    date: stat.date,
    count: stat.pomodorosCompleted,
    level: getActivityLevel(stat.pomodorosCompleted),
    focusMinutes: stat.totalFocusTimeMinutes,
  }));

  return NextResponse.json({ heatmap: heatmapData });
}

// Helper to determine activity level (0-4 for heatmap coloring)
function getActivityLevel(pomodoros: number): number {
  if (pomodoros === 0) return 0;
  if (pomodoros <= 2) return 1;
  if (pomodoros <= 4) return 2;
  if (pomodoros <= 6) return 3;
  return 4;
}

// Streak statistics
async function getStreakStats(userId: string) {
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    return NextResponse.json({
      streak: {
        current: 0,
        longest: 0,
        currentStreakStart: null,
        longestStreakStart: null,
        longestStreakEnd: null,
        lastActiveDate: null,
        isActiveToday: false,
      },
    });
  }

  const today = getDateString();
  const isActiveToday = streak.lastActiveDate === today;

  return NextResponse.json({
    streak: {
      current: streak.currentStreak,
      longest: streak.longestStreak,
      currentStreakStart: streak.currentStreakStart,
      longestStreakStart: streak.longestStreakStart,
      longestStreakEnd: streak.longestStreakEnd,
      lastActiveDate: streak.lastActiveDate,
      isActiveToday,
    },
  });
}

// Achievement statistics
async function getAchievementStats(userId: string) {
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
    }),
  ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  // Categorize achievements
  const categorized: Record<
    string,
    Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      points: number;
      isUnlocked: boolean;
      unlockedAt?: Date;
      isHidden: boolean;
    }>
  > = {};

  for (const achievement of allAchievements) {
    // Skip hidden achievements that aren't unlocked
    if (achievement.isHidden && !unlockedIds.has(achievement.id)) {
      continue;
    }

    const category = achievement.category;
    if (!categorized[category]) {
      categorized[category] = [];
    }

    const userAchievement = userAchievements.find(
      (ua) => ua.achievementId === achievement.id
    );

    categorized[category].push({
      id: achievement.id,
      code: achievement.code,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      points: achievement.points,
      isUnlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievement?.unlockedAt,
      isHidden: achievement.isHidden,
    });
  }

  // Calculate totals
  const totalPoints = userAchievements.reduce(
    (sum, ua) => sum + ua.achievement.points,
    0
  );
  const totalUnlocked = userAchievements.length;
  const totalAvailable = allAchievements.filter((a) => !a.isHidden).length;

  return NextResponse.json({
    achievements: categorized,
    summary: {
      totalPoints,
      totalUnlocked,
      totalAvailable,
      completionPercentage: Math.round((totalUnlocked / totalAvailable) * 100),
    },
    recent: userAchievements.slice(0, 5).map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      icon: ua.achievement.icon,
      unlockedAt: ua.unlockedAt,
    })),
  });
}

// Productivity insights (best focus time, patterns)
async function getProductivityInsights(
  userId: string,
  dateRange: { start: string; end: string }
) {
  // Get all sessions in the date range
  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      mode: "focus",
      status: "completed",
      startedAt: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end + "T23:59:59Z"),
      },
    },
    select: {
      startedAt: true,
      actualDuration: true,
    },
  });

  // Analyze by hour of day
  const hourlyStats: Record<number, { sessions: number; totalMinutes: number }> =
    {};
  for (let h = 0; h < 24; h++) {
    hourlyStats[h] = { sessions: 0, totalMinutes: 0 };
  }

  // Analyze by day of week
  const dailyStats: Record<number, { sessions: number; totalMinutes: number }> =
    {};
  for (let d = 0; d < 7; d++) {
    dailyStats[d] = { sessions: 0, totalMinutes: 0 };
  }

  for (const session of sessions) {
    const hour = session.startedAt.getHours();
    const day = session.startedAt.getDay();
    const minutes = Math.floor(session.actualDuration / 60);

    hourlyStats[hour].sessions += 1;
    hourlyStats[hour].totalMinutes += minutes;

    dailyStats[day].sessions += 1;
    dailyStats[day].totalMinutes += minutes;
  }

  // Find best hour and day
  let bestHour = 0;
  let bestHourSessions = 0;
  for (const [hour, stats] of Object.entries(hourlyStats)) {
    if (stats.sessions > bestHourSessions) {
      bestHour = parseInt(hour);
      bestHourSessions = stats.sessions;
    }
  }

  let bestDay = 0;
  let bestDaySessions = 0;
  for (const [day, stats] of Object.entries(dailyStats)) {
    if (stats.sessions > bestDaySessions) {
      bestDay = parseInt(day);
      bestDaySessions = stats.sessions;
    }
  }

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return NextResponse.json({
    insights: {
      bestFocusHour: bestHour,
      bestFocusHourLabel: `${bestHour.toString().padStart(2, "0")}:00`,
      bestFocusDay: bestDay,
      bestFocusDayLabel: dayNames[bestDay],
      totalSessions: sessions.length,
    },
    hourlyDistribution: Object.entries(hourlyStats).map(([hour, stats]) => ({
      hour: parseInt(hour),
      label: `${hour.padStart(2, "0")}:00`,
      sessions: stats.sessions,
      minutes: stats.totalMinutes,
    })),
    dailyDistribution: Object.entries(dailyStats).map(([day, stats]) => ({
      day: parseInt(day),
      label: dayNames[parseInt(day)],
      sessions: stats.sessions,
      minutes: stats.totalMinutes,
    })),
  });
}

// Leaderboard
async function getLeaderboard(period: string) {
  const dateRange = getDateRange(period);
  const periodKey =
    period === "week"
      ? `${new Date().getFullYear()}-W${Math.ceil(
          (new Date().getDate() + new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()) / 7
        )}`
      : period === "month"
        ? `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}`
        : "allTime";

  // Get cached leaderboard or compute from stats
  let entries = await prisma.leaderboardEntry.findMany({
    where: {
      type: period,
      period: periodKey,
    },
    orderBy: { rank: "asc" },
    take: 50,
  });

  // If no cached entries, compute from daily stats
  if (entries.length === 0) {
    const aggregatedStats = await prisma.dailyStats.groupBy({
      by: ["userId"],
      where: {
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _sum: {
        pomodorosCompleted: true,
        totalFocusTimeMinutes: true,
        tasksCompleted: true,
      },
      orderBy: {
        _sum: {
          pomodorosCompleted: "desc",
        },
      },
      take: 50,
    });

    // Get user info
    const userIds = aggregatedStats.map((s) => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    entries = aggregatedStats.map((stat, index) => {
      const user = userMap.get(stat.userId);
      return {
        id: `${period}-${periodKey}-${stat.userId}`,
        type: period,
        period: periodKey,
        userId: stat.userId,
        userName: user?.name ?? "Anonymous",
        userImage: user?.image ?? null,
        pomodorosCompleted: stat._sum.pomodorosCompleted ?? 0,
        totalFocusMinutes: stat._sum.totalFocusTimeMinutes ?? 0,
        tasksCompleted: stat._sum.tasksCompleted ?? 0,
        streakDays: 0,
        rank: index + 1,
        points:
          (stat._sum.pomodorosCompleted ?? 0) * 10 +
          (stat._sum.tasksCompleted ?? 0) * 5,
        updatedAt: new Date(),
      };
    });
  }

  return NextResponse.json({
    leaderboard: entries.map((entry) => ({
      rank: entry.rank,
      userId: entry.userId,
      userName: entry.userName,
      userImage: entry.userImage,
      pomodorosCompleted: entry.pomodorosCompleted,
      totalFocusMinutes: entry.totalFocusMinutes,
      tasksCompleted: entry.tasksCompleted,
      points: entry.points,
    })),
    period,
    periodKey,
  });
}

// POST /api/stats - Update daily stats (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const today = getDateString();

    // Upsert today's stats
    const stats = await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {
        pomodorosCompleted: body.pomodorosCompleted,
        totalFocusTimeMinutes: body.totalFocusTimeMinutes,
        tasksCompleted: body.tasksCompleted,
        dailyGoalMet: body.dailyGoalMet,
      },
      create: {
        userId: session.user.id,
        date: today,
        pomodorosCompleted: body.pomodorosCompleted ?? 0,
        totalFocusTimeMinutes: body.totalFocusTimeMinutes ?? 0,
        tasksCompleted: body.tasksCompleted ?? 0,
        dailyGoalMet: body.dailyGoalMet ?? false,
      },
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to update stats:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}

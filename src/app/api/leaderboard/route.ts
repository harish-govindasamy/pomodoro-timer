import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Type assertion for Prisma client with all models
const db = prisma as any;

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "weekly"; // weekly, monthly, allTime
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Calculate date range based on type
    const now = new Date();
    let startDate: Date | null = null;
    let period = "";

    switch (type) {
      case "weekly": {
        // Start of current week (Monday)
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysFromMonday);
        startDate.setHours(0, 0, 0, 0);

        // Calculate week number
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(
          ((now.getTime() - startOfYear.getTime()) / 86400000 +
            startOfYear.getDay() +
            1) /
            7,
        );
        period = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
        break;
      }

      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        period = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
        break;

      case "allTime":
        period = "all-time";
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid leaderboard type. Use 'weekly', 'monthly', or 'allTime'",
          },
          { status: 400 },
        );
    }

    // Get all users with their pomodoro stats
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    });

    // Get pomodoro session stats for all users
    const sessionStats = await db.pomodoroSession.groupBy({
      by: ["userId"],
      where: {
        mode: "focus",
        status: "completed",
        ...(startDate && { startedAt: { gte: startDate } }),
      },
      _count: {
        id: true,
      },
      _sum: {
        actualDuration: true,
      },
    });

    // Get completed tasks count for all users
    const taskStats = await db.task.groupBy({
      by: ["userId"],
      where: {
        isCompleted: true,
        ...(startDate && { completedAt: { gte: startDate } }),
      },
      _count: {
        id: true,
      },
    });

    // Get streak data for all users
    const streaks = await db.streak.findMany({
      select: {
        userId: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    // Create lookup maps for efficient access
    const sessionStatsMap = new Map<
      string,
      { pomodorosCompleted: number; totalFocusSeconds: number }
    >(
      sessionStats.map((s: any) => [
        s.userId,
        {
          pomodorosCompleted: s._count.id,
          totalFocusSeconds: s._sum.actualDuration || 0,
        },
      ]),
    );

    const taskStatsMap = new Map<string, number>(
      taskStats.map((t: any) => [t.userId, t._count.id]),
    );

    const streakMap = new Map<string, { current: number; longest: number }>(
      streaks.map((s: any) => [
        s.userId,
        { current: s.currentStreak, longest: s.longestStreak },
      ]),
    );

    // Calculate stats for each user
    interface ComputedUserStats {
      userId: string;
      userName: string;
      userImage: string | null;
      pomodorosCompleted: number;
      totalFocusMinutes: number;
      tasksCompleted: number;
      streakDays: number;
      points: number;
    }

    const computedStats: ComputedUserStats[] = users
      .map((user: any) => {
        const sessionData = sessionStatsMap.get(user.id) || {
          pomodorosCompleted: 0,
          totalFocusSeconds: 0,
        };
        const tasksCompleted = taskStatsMap.get(user.id) || 0;
        const streakData = streakMap.get(user.id) || { current: 0, longest: 0 };

        const pomodorosCompleted = sessionData.pomodorosCompleted;
        const totalFocusMinutes = Math.floor(
          sessionData.totalFocusSeconds / 60,
        );
        const streakDays =
          type === "allTime" ? streakData.longest : streakData.current;

        // Calculate points: weighted score
        // Pomodoros: 10 points each
        // Focus time: 5 points per 10 minutes
        // Tasks: 15 points each
        // Streak: 20 points per day
        const points =
          pomodorosCompleted * 10 +
          Math.floor(totalFocusMinutes / 10) * 5 +
          tasksCompleted * 15 +
          streakDays * 20;

        return {
          userId: user.id,
          userName: user.name || user.username || "Anonymous",
          userImage: user.image,
          pomodorosCompleted,
          totalFocusMinutes,
          tasksCompleted,
          streakDays,
          points,
        };
      })
      .filter((stats: ComputedUserStats) => stats.points > 0)
      .sort(
        (a: ComputedUserStats, b: ComputedUserStats) => b.points - a.points,
      );

    // Assign ranks
    const rankedStats = computedStats.map((stats, index) => ({
      ...stats,
      rank: index + 1,
    }));

    // Apply pagination
    const paginatedStats = rankedStats.slice(offset, offset + limit);

    // Get current user's rank if authenticated
    let currentUserRank: {
      rank: number;
      points: number;
      pomodorosCompleted: number;
      totalFocusMinutes: number;
      tasksCompleted: number;
      streakDays: number;
    } | null = null;

    if (session?.user?.id) {
      const userEntry = rankedStats.find(
        (entry) => entry.userId === session.user.id,
      );

      if (userEntry) {
        currentUserRank = {
          rank: userEntry.rank,
          points: userEntry.points,
          pomodorosCompleted: userEntry.pomodorosCompleted,
          totalFocusMinutes: userEntry.totalFocusMinutes,
          tasksCompleted: userEntry.tasksCompleted,
          streakDays: userEntry.streakDays,
        };
      }
    }

    const totalCount = rankedStats.length;

    return NextResponse.json({
      leaderboard: paginatedStats.map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        userName: entry.userName,
        userImage: entry.userImage,
        points: entry.points,
        pomodorosCompleted: entry.pomodorosCompleted,
        totalFocusMinutes: entry.totalFocusMinutes,
        tasksCompleted: entry.tasksCompleted,
        streakDays: entry.streakDays,
      })),
      currentUser: currentUserRank,
      meta: {
        type,
        period,
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}

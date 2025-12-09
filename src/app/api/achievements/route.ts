import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Type assertion for Prisma client with all models
const db = prisma as any;

// GET /api/achievements - Get all achievements with user progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeHidden = searchParams.get("includeHidden") === "true";

    // Get all achievements
    const achievements = await db.achievement.findMany({
      where: {
        ...(category && { category }),
        ...(!includeHidden && { isHidden: false }),
      },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Get user's unlocked achievements
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
    });

    // Get user stats for progress calculation
    const [totalPomodoros, totalFocusMinutes, totalTasks, streak, friendCount] =
      await Promise.all([
        // Total completed pomodoros
        db.pomodoroSession.count({
          where: {
            userId: session.user.id,
            mode: "focus",
            status: "completed",
          },
        }),
        // Total focus time in minutes
        db.pomodoroSession.aggregate({
          where: {
            userId: session.user.id,
            mode: "focus",
            status: "completed",
          },
          _sum: { actualDuration: true },
        }),
        // Total completed tasks
        db.task.count({
          where: {
            userId: session.user.id,
            isCompleted: true,
          },
        }),
        // Current streak
        db.streak.findUnique({
          where: { userId: session.user.id },
        }),
        // Friend count
        db.friendship.count({
          where: {
            OR: [
              { initiatorId: session.user.id, status: "accepted" },
              { receiverId: session.user.id, status: "accepted" },
            ],
          },
        }),
      ]);

    const focusMinutes = Math.floor(
      (totalFocusMinutes._sum.actualDuration || 0) / 60,
    );
    const currentStreak = streak?.currentStreak || 0;

    // Calculate progress for each achievement
    const achievementsWithProgress = achievements.map((achievement: any) => {
      const userAchievement = userAchievements.find(
        (ua: any) => ua.achievementId === achievement.id,
      );

      // Calculate current progress based on category
      let currentProgress = 0;
      switch (achievement.category) {
        case "pomodoros":
          currentProgress = totalPomodoros;
          break;
        case "time":
          currentProgress = focusMinutes;
          break;
        case "tasks":
          currentProgress = totalTasks;
          break;
        case "streaks":
          currentProgress = currentStreak;
          break;
        case "social":
          currentProgress = friendCount;
          break;
        default:
          currentProgress = userAchievement?.progress || 0;
      }

      const isUnlocked = !!userAchievement?.isCompleted;
      const progressPercentage = Math.min(
        100,
        (currentProgress / achievement.requirement) * 100,
      );

      return {
        achievementId: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        points: achievement.points,
        requirement: achievement.requirement,
        currentProgress: Math.min(currentProgress, achievement.requirement),
        isUnlocked,
        unlockedAt: userAchievement?.unlockedAt?.toISOString(),
        progressPercentage,
      };
    });

    // Calculate stats
    const stats = {
      totalAchievements: achievements.length,
      unlockedAchievements: userAchievements.filter((ua: any) => ua.isCompleted)
        .length,
      totalPoints: achievements.reduce(
        (sum: number, a: any) => sum + a.points,
        0,
      ),
      earnedPoints: userAchievements
        .filter((ua: any) => ua.isCompleted)
        .reduce((sum: number, ua: any) => sum + ua.achievement.points, 0),
      recentUnlocks: userAchievements
        .filter((ua: any) => ua.isCompleted)
        .sort(
          (a: any, b: any) =>
            new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
        )
        .slice(0, 5)
        .map((ua: any) => ({
          id: ua.id,
          achievementId: ua.achievementId,
          unlockedAt: ua.unlockedAt.toISOString(),
          achievement: {
            id: ua.achievement.id,
            code: ua.achievement.code,
            name: ua.achievement.name,
            description: ua.achievement.description,
            icon: ua.achievement.icon,
            category: ua.achievement.category,
            rarity: ua.achievement.rarity,
            points: ua.achievement.points,
          },
        })),
    };

    return NextResponse.json({
      achievements: achievementsWithProgress,
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 },
    );
  }
}

// POST /api/achievements - Check and unlock achievements
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body; // Type of action that might trigger achievements

    // Get user stats
    const [totalPomodoros, totalFocusMinutes, totalTasks, streak, friendCount] =
      await Promise.all([
        db.pomodoroSession.count({
          where: {
            userId: session.user.id,
            mode: "focus",
            status: "completed",
          },
        }),
        db.pomodoroSession.aggregate({
          where: {
            userId: session.user.id,
            mode: "focus",
            status: "completed",
          },
          _sum: { actualDuration: true },
        }),
        db.task.count({
          where: {
            userId: session.user.id,
            isCompleted: true,
          },
        }),
        db.streak.findUnique({
          where: { userId: session.user.id },
        }),
        db.friendship.count({
          where: {
            OR: [
              { initiatorId: session.user.id, status: "accepted" },
              { receiverId: session.user.id, status: "accepted" },
            ],
          },
        }),
      ]);

    const focusMinutes = Math.floor(
      (totalFocusMinutes._sum.actualDuration || 0) / 60,
    );
    const currentStreak = streak?.currentStreak || 0;

    // Get all achievements not yet unlocked by user
    const unlockedAchievementIds = await db.userAchievement.findMany({
      where: { userId: session.user.id, isCompleted: true },
      select: { achievementId: true },
    });

    const achievements = await db.achievement.findMany({
      where: {
        id: {
          notIn: unlockedAchievementIds.map((ua: any) => ua.achievementId),
        },
      },
    });

    // Check which achievements should be unlocked
    const newlyUnlocked: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      points: number;
      category: string;
      requirement: number;
      isHidden: boolean;
      order: number;
    }> = [];

    for (const achievement of achievements) {
      let currentProgress = 0;

      switch (achievement.category) {
        case "pomodoros":
          currentProgress = totalPomodoros;
          break;
        case "time":
          currentProgress = focusMinutes;
          break;
        case "tasks":
          currentProgress = totalTasks;
          break;
        case "streaks":
          currentProgress = currentStreak;
          break;
        case "social":
          currentProgress = friendCount;
          break;
      }

      if (currentProgress >= achievement.requirement) {
        // Unlock the achievement
        await db.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: achievement.id,
            progress: achievement.requirement,
            isCompleted: true,
          },
        });

        newlyUnlocked.push(achievement);
      }
    }

    return NextResponse.json({
      success: true,
      newlyUnlocked,
      type,
    });
  } catch (error) {
    console.error("Failed to check achievements:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 },
    );
  }
}

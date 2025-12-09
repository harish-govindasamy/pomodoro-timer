import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

// Validation schemas
const createSessionSchema = z.object({
  taskId: z.string().optional(),
  focusRoomId: z.string().optional(),
  mode: z.enum(["focus", "shortBreak", "longBreak"]).default("focus"),
  plannedDuration: z.number().int().min(1).max(7200), // 1 second to 2 hours
});

const completeSessionSchema = z.object({
  id: z.string(),
  actualDuration: z.number().int().min(0),
  status: z
    .enum(["completed", "cancelled", "interrupted"])
    .default("completed"),
  distractionCount: z.number().int().min(0).optional(),
});

// Helper to update daily stats
async function updateDailyStats(
  userId: string,
  mode: string,
  durationMinutes: number,
  isCompleted: boolean,
) {
  const today = new Date().toISOString().split("T")[0];

  const updateData: Record<string, unknown> = {};

  if (mode === "focus" && isCompleted) {
    updateData.pomodorosCompleted = { increment: 1 };
    updateData.totalFocusTimeMinutes = { increment: durationMinutes };
    updateData.focusSessions = { increment: 1 };
  } else if (mode === "shortBreak" && isCompleted) {
    updateData.shortBreaks = { increment: 1 };
  } else if (mode === "longBreak" && isCompleted) {
    updateData.longBreaks = { increment: 1 };
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: updateData,
      create: {
        userId,
        date: today,
        pomodorosCompleted: mode === "focus" && isCompleted ? 1 : 0,
        totalFocusTimeMinutes:
          mode === "focus" && isCompleted ? durationMinutes : 0,
        focusSessions: mode === "focus" && isCompleted ? 1 : 0,
        shortBreaks: mode === "shortBreak" && isCompleted ? 1 : 0,
        longBreaks: mode === "longBreak" && isCompleted ? 1 : 0,
      },
    });
  }
}

// Helper to update streak
async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    // Create new streak record
    await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        currentStreakStart: today,
        longestStreak: 1,
        longestStreakStart: today,
        longestStreakEnd: today,
        lastActiveDate: today,
      },
    });
    return;
  }

  // If already updated today, skip
  if (streak.lastActiveDate === today) {
    return;
  }

  // Check if this continues the streak
  if (streak.lastActiveDate === yesterday) {
    // Continuing streak
    const newCurrentStreak = streak.currentStreak + 1;
    const isNewRecord = newCurrentStreak > streak.longestStreak;

    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        lastActiveDate: today,
        ...(isNewRecord && {
          longestStreak: newCurrentStreak,
          longestStreakEnd: today,
        }),
      },
    });
  } else {
    // Streak broken, start new one
    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        currentStreakStart: today,
        lastActiveDate: today,
      },
    });
  }
}

// Helper to check and award achievements
async function checkAchievements(userId: string) {
  // Get user's current stats
  const [totalSessions, todayStats, streak, taskCount] = await Promise.all([
    prisma.pomodoroSession.count({
      where: { userId, status: "completed", mode: "focus" },
    }),
    prisma.dailyStats.findFirst({
      where: { userId, date: new Date().toISOString().split("T")[0] },
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.task.count({ where: { userId, isCompleted: true } }),
  ]);

  // Get all achievements
  const achievements = await prisma.achievement.findMany();

  // Get user's existing achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));

  // Check each achievement
  const newAchievements: string[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.category) {
      case "pomodoros":
        shouldUnlock = totalSessions >= achievement.requirement;
        break;
      case "streaks":
        shouldUnlock = (streak?.currentStreak ?? 0) >= achievement.requirement;
        break;
      case "tasks":
        shouldUnlock = taskCount >= achievement.requirement;
        break;
      case "time":
        // Total focus time in hours
        const totalMinutes = await prisma.dailyStats.aggregate({
          where: { userId },
          _sum: { totalFocusTimeMinutes: true },
        });
        shouldUnlock =
          (totalMinutes._sum.totalFocusTimeMinutes ?? 0) / 60 >=
          achievement.requirement;
        break;
    }

    if (shouldUnlock) {
      newAchievements.push(achievement.id);
    }
  }

  // Award new achievements
  if (newAchievements.length > 0) {
    // Use individual creates with try-catch for SQLite compatibility
    for (const achievementId of newAchievements) {
      try {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId,
          },
        });
      } catch {
        // Ignore duplicate key errors
      }
    }
  }

  return newAchievements;
}

// GET /api/sessions - Get user's pomodoro sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const mode = searchParams.get("mode");
    const taskId = searchParams.get("taskId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: {
      userId: string;
      mode?: string;
      taskId?: string;
      startedAt?: { gte?: Date; lte?: Date };
    } = {
      userId: session.user.id,
    };

    if (mode) where.mode = mode;
    if (taskId) where.taskId = taskId;
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(startDate);
      if (endDate) where.startedAt.lte = new Date(endDate);
    }

    const [sessions, total] = await Promise.all([
      prisma.pomodoroSession.findMany({
        where,
        include: {
          task: {
            select: {
              id: true,
              title: true,
              color: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.pomodoroSession.count({ where }),
    ]);

    return NextResponse.json({
      sessions,
      total,
      limit,
      offset,
      hasMore: offset + sessions.length < total,
    });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

// POST /api/sessions - Start a new pomodoro session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    // Verify task belongs to user if provided
    if (validatedData.taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: validatedData.taskId,
          userId: session.user.id,
        },
      });

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
    }

    // Create the session
    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: session.user.id,
        taskId: validatedData.taskId,
        focusRoomId: validatedData.focusRoomId,
        mode: validatedData.mode,
        plannedDuration: validatedData.plannedDuration,
        startedAt: new Date(),
        status: "completed", // Will be updated when session ends
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ session: pomodoroSession }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

// PATCH /api/sessions - Complete/update a pomodoro session
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = completeSessionSchema.parse(body);

    // Verify session belongs to user
    const existingSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: validatedData.id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Update the session
    const updatedSession = await prisma.pomodoroSession.update({
      where: { id: validatedData.id },
      data: {
        actualDuration: validatedData.actualDuration,
        status: validatedData.status,
        endedAt: new Date(),
        distractionCount: validatedData.distractionCount ?? 0,
      },
    });

    // Update daily stats if session was completed
    const isCompleted = validatedData.status === "completed";
    const durationMinutes = Math.floor(validatedData.actualDuration / 60);

    await updateDailyStats(
      session.user.id,
      existingSession.mode,
      durationMinutes,
      isCompleted,
    );

    // Update task's completed pomodoros if it was a focus session
    if (
      isCompleted &&
      existingSession.mode === "focus" &&
      existingSession.taskId
    ) {
      await prisma.task.update({
        where: { id: existingSession.taskId },
        data: {
          completedPomodoros: { increment: 1 },
        },
      });
    }

    // Update streak if it was a completed focus session
    if (isCompleted && existingSession.mode === "focus") {
      await updateStreak(session.user.id);

      // Check for new achievements
      const newAchievements = await checkAchievements(session.user.id);

      return NextResponse.json({
        session: updatedSession,
        newAchievements,
      });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to update session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 },
    );
  }
}

// DELETE /api/sessions - Delete a session (admin or owner only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Verify session belongs to user
    const existingSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.pomodoroSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}

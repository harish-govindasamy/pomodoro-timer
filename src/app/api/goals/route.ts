import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/goals - Get user's current goal and progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get active goal
    const activeGoal = await db.dailyGoal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get today's stats for progress
    const todayStats = await db.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // Calculate progress
    const targetPomodoros = activeGoal?.targetPomodoros ?? 8;
    const completedPomodoros = todayStats?.pomodorosCompleted ?? 0;
    const progressPercentage = Math.min(
      Math.round((completedPomodoros / targetPomodoros) * 100),
      100,
    );
    const goalMet = completedPomodoros >= targetPomodoros;

    return NextResponse.json({
      goal: {
        id: activeGoal?.id ?? null,
        targetPomodoros,
        targetFocusMinutes: activeGoal?.targetFocusMinutes ?? null,
        isActive: activeGoal?.isActive ?? false,
      },
      progress: {
        completedPomodoros,
        totalFocusMinutes: todayStats?.totalFocusTimeMinutes ?? 0,
        progressPercentage,
        goalMet,
        date: today,
      },
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 },
    );
  }
}

// POST /api/goals - Create or update goal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { targetPomodoros, targetFocusMinutes } = body;

    if (!targetPomodoros || targetPomodoros < 1 || targetPomodoros > 50) {
      return NextResponse.json(
        { error: "Target pomodoros must be between 1 and 50" },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Deactivate any existing active goals
    await db.dailyGoal.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: today,
      },
    });

    // Create new goal
    const goal = await db.dailyGoal.create({
      data: {
        userId,
        targetPomodoros,
        targetFocusMinutes: targetFocusMinutes ?? null,
        isActive: true,
        startDate: today,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 },
    );
  }
}

// PATCH /api/goals - Update existing goal
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { targetPomodoros, isActive } = body;

    // Find active goal
    const activeGoal = await db.dailyGoal.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!activeGoal) {
      return NextResponse.json(
        { error: "No active goal found" },
        { status: 404 },
      );
    }

    const updatedGoal = await db.dailyGoal.update({
      where: { id: activeGoal.id },
      data: {
        targetPomodoros: targetPomodoros ?? activeGoal.targetPomodoros,
        isActive: isActive ?? activeGoal.isActive,
        endDate:
          isActive === false
            ? new Date().toISOString().split("T")[0]
            : undefined,
      },
    });

    return NextResponse.json({ goal: updatedGoal });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 },
    );
  }
}

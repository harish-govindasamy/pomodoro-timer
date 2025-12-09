import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  estimatedPomodoros: z.number().int().min(1).max(100).default(1),
  categoryId: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  priority: z.number().int().min(0).max(3).optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  estimatedPomodoros: z.number().int().min(1).max(100).optional(),
  completedPomodoros: z.number().int().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  priority: z.number().int().min(0).max(3).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isCompleted: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  order: z.number().int().optional(),
});

// GET /api/tasks - Get all tasks for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("archived") === "true";
    const includeCompleted = searchParams.get("completed") !== "false";
    const categoryId = searchParams.get("categoryId");

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        isArchived: includeArchived ? undefined : false,
        isCompleted: includeCompleted ? undefined : false,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            pomodoroSessions: true,
            notes: true,
          },
        },
      },
      orderBy: [
        { isCompleted: "asc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Get the highest order value for positioning
    const lastTask = await prisma.task.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        estimatedPomodoros: validatedData.estimatedPomodoros,
        categoryId: validatedData.categoryId,
        color: validatedData.color || "#3B82F6",
        priority: validatedData.priority || 0,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        order: (lastTask?.order ?? 0) + 1,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Update daily stats for task creation
    const today = new Date().toISOString().split("T")[0];
    await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {
        tasksCreated: { increment: 1 },
      },
      create: {
        userId: session.user.id,
        date: today,
        tasksCreated: 1,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

// PATCH /api/tasks - Update a task
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Prepare update data
    const prismaUpdateData: Record<string, unknown> = {};

    if (updateData.title !== undefined)
      prismaUpdateData.title = updateData.title;
    if (updateData.description !== undefined)
      prismaUpdateData.description = updateData.description;
    if (updateData.estimatedPomodoros !== undefined)
      prismaUpdateData.estimatedPomodoros = updateData.estimatedPomodoros;
    if (updateData.completedPomodoros !== undefined)
      prismaUpdateData.completedPomodoros = updateData.completedPomodoros;
    if (updateData.categoryId !== undefined)
      prismaUpdateData.categoryId = updateData.categoryId;
    if (updateData.color !== undefined)
      prismaUpdateData.color = updateData.color;
    if (updateData.priority !== undefined)
      prismaUpdateData.priority = updateData.priority;
    if (updateData.order !== undefined)
      prismaUpdateData.order = updateData.order;
    if (updateData.isArchived !== undefined)
      prismaUpdateData.isArchived = updateData.isArchived;

    if (updateData.dueDate !== undefined) {
      prismaUpdateData.dueDate = updateData.dueDate
        ? new Date(updateData.dueDate)
        : null;
    }

    // Handle completion status change
    if (updateData.isCompleted !== undefined) {
      prismaUpdateData.isCompleted = updateData.isCompleted;
      prismaUpdateData.completedAt = updateData.isCompleted ? new Date() : null;

      // Update daily stats if task is being completed
      if (updateData.isCompleted && !existingTask.isCompleted) {
        const today = new Date().toISOString().split("T")[0];
        await prisma.dailyStats.upsert({
          where: {
            userId_date: {
              userId: session.user.id,
              date: today,
            },
          },
          update: {
            tasksCompleted: { increment: 1 },
          },
          create: {
            userId: session.user.id,
            date: today,
            tasksCompleted: 1,
          },
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}

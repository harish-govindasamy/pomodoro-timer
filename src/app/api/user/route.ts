import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  image: z.string().url().optional(),
});

const updateSettingsSchema = z.object({
  // Timer settings
  focusTime: z.number().int().min(1).max(120).optional(),
  shortBreakTime: z.number().int().min(1).max(60).optional(),
  longBreakTime: z.number().int().min(1).max(120).optional(),
  longBreakAfter: z.number().int().min(1).max(10).optional(),

  // Automation
  autoStartNextSession: z.boolean().optional(),
  autoStartBreak: z.boolean().optional(),

  // Notifications
  soundEnabled: z.boolean().optional(),
  notificationEnabled: z.boolean().optional(),
  notificationAdvanceTime: z.number().int().min(0).max(300).optional(),
  alarmSound: z.string().optional(),

  // Appearance
  theme: z.enum(["light", "dark", "system"]).optional(),

  // Privacy
  showOnLeaderboard: z.boolean().optional(),
  allowFriendRequests: z.boolean().optional(),
  publicProfile: z.boolean().optional(),

  // Weekly report
  weeklyReportEnabled: z.boolean().optional(),
  weeklyReportDay: z.number().int().min(0).max(6).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional(),
});

// GET /api/user - Get current user profile and settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeSettings = searchParams.get("settings") !== "false";
    const includeStats = searchParams.get("stats") === "true";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        timezone: true,
        createdAt: true,
        lastActiveAt: true,
        ...(includeSettings && {
          settings: {
            select: {
              focusTime: true,
              shortBreakTime: true,
              longBreakTime: true,
              longBreakAfter: true,
              autoStartNextSession: true,
              autoStartBreak: true,
              soundEnabled: true,
              notificationEnabled: true,
              notificationAdvanceTime: true,
              alarmSound: true,
              theme: true,
              showOnLeaderboard: true,
              allowFriendRequests: true,
              publicProfile: true,
              weeklyReportEnabled: true,
              weeklyReportDay: true,
            },
          },
        }),
        ...(includeStats && {
          streak: {
            select: {
              currentStreak: true,
              longestStreak: true,
              lastActiveDate: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              pomodoroSessions: true,
              achievements: true,
            },
          },
        }),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PATCH /api/user - Update user profile or settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "profile":
        return await updateProfile(session.user.id, body.data);

      case "settings":
        return await updateSettings(session.user.id, body.data);

      case "password":
        return await changePassword(session.user.id, body.data);

      default:
        return NextResponse.json(
          {
            error:
              "Invalid update type. Use 'profile', 'settings', or 'password'",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// Update user profile
async function updateProfile(userId: string, data: unknown) {
  const validatedData = updateProfileSchema.parse(data);

  // Check username uniqueness if updating
  if (validatedData.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: validatedData.name,
      username: validatedData.username,
      bio: validatedData.bio,
      timezone: validatedData.timezone,
      image: validatedData.image,
      lastActiveAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      timezone: true,
    },
  });

  return NextResponse.json({ user });
}

// Update user settings
async function updateSettings(userId: string, data: unknown) {
  const validatedData = updateSettingsSchema.parse(data);

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: validatedData,
    create: {
      userId,
      ...validatedData,
    },
  });

  return NextResponse.json({ settings });
}

// Change password
async function changePassword(userId: string, data: unknown) {
  const validatedData = changePasswordSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "Cannot change password for OAuth accounts" },
      { status: 400 },
    );
  }

  // Verify current password
  const bcrypt = await import("bcryptjs");
  const isValid = await bcrypt.compare(
    validatedData.currentPassword,
    user.passwordHash,
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
    );
  }

  // Hash and update new password
  const newPasswordHash = await hashPassword(validatedData.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ success: true });
}

// POST /api/user - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user with default settings
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        name: validatedData.name,
        passwordHash,
        settings: {
          create: {}, // Uses default values from schema
        },
        streak: {
          create: {}, // Initialize streak record
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to register user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}

// DELETE /api/user - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { confirmEmail } = body;

    // Verify email matches for confirmation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (confirmEmail !== user.email) {
      return NextResponse.json(
        { error: "Email confirmation does not match" },
        { status: 400 },
      );
    }

    // Delete user (cascades to all related data)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}

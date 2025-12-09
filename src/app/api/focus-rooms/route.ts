import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Type assertion for Prisma client with all models
const db = prisma as any;

// Validation schemas
const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(50).default(10),
  focusTime: z.number().int().min(5).max(120).default(25),
  breakTime: z.number().int().min(1).max(60).default(5),
});

const joinRoomSchema = z.object({
  inviteCode: z.string().min(1),
});

const updateRoomSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  maxMembers: z.number().int().min(2).max(50).optional(),
  focusTime: z.number().int().min(5).max(120).optional(),
  breakTime: z.number().int().min(1).max(60).optional(),
  currentMode: z.enum(["idle", "focus", "break"]).optional(),
});

// Helper to generate invite codes
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/focus-rooms - List rooms or get specific room
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const roomId = searchParams.get("id");
    const inviteCode = searchParams.get("inviteCode");
    const type = searchParams.get("type") || "my"; // my, public, all

    // Get specific room by ID
    if (roomId) {
      const room = await db.focusRoom.findUnique({
        where: { id: roomId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
          _count: {
            select: { members: true, sessions: true },
          },
        },
      });

      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      // Check access permissions
      const isMember = room.members.some(
        (m: { userId: string }) => m.userId === session?.user?.id,
      );
      const isOwner = room.ownerId === session?.user?.id;

      if (!room.isPublic && !isMember && !isOwner) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({
        room: {
          ...room,
          isMember,
          isOwner,
        },
      });
    }

    // Get room by invite code
    if (inviteCode) {
      const room = await db.focusRoom.findUnique({
        where: { inviteCode },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
      });

      if (!room) {
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        room: {
          id: room.id,
          name: room.name,
          description: room.description,
          owner: room.owner,
          memberCount: room._count.members,
          maxMembers: room.maxMembers,
          focusTime: room.focusTime,
          breakTime: room.breakTime,
        },
      });
    }

    // List rooms based on type
    let rooms: any[] | undefined;

    switch (type) {
      case "my":
        // Rooms user is a member of or owns
        if (!session?.user?.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        rooms = await db.focusRoom.findMany({
          where: {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { userId: session.user.id } } },
            ],
            isActive: true,
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        });
        break;

      case "public":
        // Public rooms
        rooms = await db.focusRoom.findMany({
          where: {
            isPublic: true,
            isActive: true,
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
          orderBy: [
            { currentMode: "asc" }, // Active rooms first
            { updatedAt: "desc" },
          ],
          take: 50,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 },
        );
    }

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Failed to fetch focus rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus rooms" },
      { status: 500 },
    );
  }
}

// POST /api/focus-rooms - Create or join a room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create": {
        const validatedData = createRoomSchema.parse(body);

        // Generate unique invite code
        let inviteCode = generateInviteCode();
        let attempts = 0;
        while (attempts < 10) {
          const existing = await db.focusRoom.findUnique({
            where: { inviteCode },
          });
          if (!existing) break;
          inviteCode = generateInviteCode();
          attempts++;
        }

        // Create room and add owner as member
        const room = await db.focusRoom.create({
          data: {
            ownerId: session.user.id,
            name: validatedData.name,
            description: validatedData.description,
            isPublic: validatedData.isPublic,
            maxMembers: validatedData.maxMembers,
            focusTime: validatedData.focusTime,
            breakTime: validatedData.breakTime,
            inviteCode,
            members: {
              create: {
                userId: session.user.id,
                role: "owner",
              },
            },
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },
            },
          },
        });

        return NextResponse.json({ room }, { status: 201 });
      }

      case "join": {
        const validatedData = joinRoomSchema.parse(body);

        // Find room by invite code
        const room = await db.focusRoom.findUnique({
          where: { inviteCode: validatedData.inviteCode.toUpperCase() },
          include: {
            _count: { select: { members: true } },
          },
        });

        if (!room) {
          return NextResponse.json(
            { error: "Invalid invite code" },
            { status: 404 },
          );
        }

        if (!room.isActive) {
          return NextResponse.json(
            { error: "This room is no longer active" },
            { status: 400 },
          );
        }

        // Check if already a member
        const existingMember = await db.focusRoomMember.findUnique({
          where: {
            roomId_userId: {
              roomId: room.id,
              userId: session.user.id,
            },
          },
        });

        if (existingMember) {
          return NextResponse.json(
            { error: "You are already a member of this room" },
            { status: 400 },
          );
        }

        // Check room capacity
        if (room._count.members >= room.maxMembers) {
          return NextResponse.json(
            { error: "This room is full" },
            { status: 400 },
          );
        }

        // Add member
        await db.focusRoomMember.create({
          data: {
            roomId: room.id,
            userId: session.user.id,
            role: "member",
          },
        });

        // Get updated room
        const updatedRoom = await db.focusRoom.findUnique({
          where: { id: room.id },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },
            },
          },
        });

        return NextResponse.json({ room: updatedRoom });
      }

      case "leave": {
        const { roomId } = body;

        if (!roomId) {
          return NextResponse.json(
            { error: "Room ID is required" },
            { status: 400 },
          );
        }

        const room = await db.focusRoom.findUnique({
          where: { id: roomId },
        });

        if (!room) {
          return NextResponse.json(
            { error: "Room not found" },
            { status: 404 },
          );
        }

        // Owner cannot leave, must delete or transfer
        if (room.ownerId === session.user.id) {
          return NextResponse.json(
            {
              error:
                "Owner cannot leave the room. Transfer ownership or delete the room instead.",
            },
            { status: 400 },
          );
        }

        // Remove member
        await db.focusRoomMember.delete({
          where: {
            roomId_userId: {
              roomId,
              userId: session.user.id,
            },
          },
        });

        return NextResponse.json({ success: true });
      }

      case "start-session": {
        const { roomId, mode } = body;

        if (!roomId || !mode) {
          return NextResponse.json(
            { error: "Room ID and mode are required" },
            { status: 400 },
          );
        }

        const room = await db.focusRoom.findUnique({
          where: { id: roomId },
        });

        if (!room) {
          return NextResponse.json(
            { error: "Room not found" },
            { status: 404 },
          );
        }

        // Only owner or admin can start sessions
        const member = await db.focusRoomMember.findUnique({
          where: {
            roomId_userId: {
              roomId,
              userId: session.user.id,
            },
          },
        });

        if (!member || (member.role !== "owner" && member.role !== "admin")) {
          return NextResponse.json(
            { error: "Only room owner or admin can start sessions" },
            { status: 403 },
          );
        }

        // Update room state
        const updatedRoom = await db.focusRoom.update({
          where: { id: roomId },
          data: {
            currentMode: mode,
            sessionStartedAt: new Date(),
          },
        });

        return NextResponse.json({ room: updatedRoom });
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use 'create', 'join', 'leave', or 'start-session'",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to process focus room request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

// PATCH /api/focus-rooms - Update room settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateRoomSchema.parse(body);

    // Verify ownership
    const room = await db.focusRoom.findUnique({
      where: { id: validatedData.id },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can update room settings" },
        { status: 403 },
      );
    }

    // Update room
    const { id, ...updateData } = validatedData;
    const updatedRoom = await db.focusRoom.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to update focus room:", error);
    return NextResponse.json(
      { error: "Failed to update focus room" },
      { status: 500 },
    );
  }
}

// DELETE /api/focus-rooms - Delete a room
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("id");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const room = await db.focusRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can delete the room" },
        { status: 403 },
      );
    }

    // Delete room (will cascade delete members)
    await db.focusRoom.delete({
      where: { id: roomId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete focus room:", error);
    return NextResponse.json(
      { error: "Failed to delete focus room" },
      { status: 500 },
    );
  }
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Coffee,
  Copy,
  Check,
  Crown,
  Flame,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Pause,
  Play,
  Settings,
  SkipForward,
  Trash2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FocusRoomMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface FocusRoom {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isActive: boolean;
  maxMembers: number;
  focusTime: number;
  breakTime: number;
  currentMode: "idle" | "focus" | "break";
  sessionStartedAt: string | null;
  inviteCode: string | null;
  owner: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  members: FocusRoomMember[];
  _count: {
    members: number;
    sessions: number;
  };
  isMember: boolean;
  isOwner: boolean;
}

export default function FocusRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<FocusRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // Resolve params
  useEffect(() => {
    params.then((p) => setRoomId(p.id));
  }, [params]);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`/api/focus-rooms?id=${roomId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Room not found");
        }
        if (response.status === 403) {
          throw new Error("Access denied");
        }
        throw new Error("Failed to load room");
      }

      const data = await response.json();
      setRoom(data.room);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Initial fetch
  useEffect(() => {
    if (roomId && status === "authenticated") {
      fetchRoom();
    } else if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/focus-rooms/${roomId}`);
    }
  }, [roomId, status, fetchRoom, router]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!roomId || status !== "authenticated") return;

    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [roomId, status, fetchRoom]);

  // Calculate timer progress
  useEffect(() => {
    if (!room || room.currentMode === "idle" || !room.sessionStartedAt) {
      setCurrentTime(0);
      setProgress(0);
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(room.sessionStartedAt!).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const totalDuration =
        (room.currentMode === "focus" ? room.focusTime : room.breakTime) * 60;
      const remaining = Math.max(0, totalDuration - elapsedSeconds);
      const progressPercent = Math.min(
        100,
        (elapsedSeconds / totalDuration) * 100,
      );

      setCurrentTime(remaining);
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "Invite code copied!",
        description: "Share this code with friends to invite them",
      });
    }
  };

  const handleStartSession = async (mode: "focus" | "break") => {
    try {
      setIsStarting(true);
      const response = await fetch("/api/focus-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start-session",
          roomId: room?.id,
          mode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start session");
      }

      toast({
        title: mode === "focus" ? "Focus session started!" : "Break started!",
        description:
          mode === "focus"
            ? "Time to concentrate 🎯"
            : "Take a well-deserved break ☕",
      });

      fetchRoom();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to start session",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopSession = async () => {
    try {
      const response = await fetch("/api/focus-rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: room?.id,
          currentMode: "idle",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to stop session");
      }

      toast({
        title: "Session stopped",
      });

      fetchRoom();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to stop session",
        variant: "destructive",
      });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      setIsLeaving(true);
      const response = await fetch("/api/focus-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          roomId: room?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to leave room");
      }

      toast({
        title: "Left room",
        description: `You've left "${room?.name}"`,
      });

      router.push("/focus-rooms");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to leave room",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
      setShowLeaveDialog(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const response = await fetch(`/api/focus-rooms?id=${room?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      toast({
        title: "Room deleted",
        description: `"${room?.name}" has been deleted`,
      });

      router.push("/focus-rooms");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "focus":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "break":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const canControl =
    room?.isOwner ||
    room?.members?.some(
      (m) => m.userId === session?.user?.id && m.role === "admin",
    );

  // Loading state
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <p className="text-muted-foreground mb-4">
            The room may have been deleted or you don&apos;t have access.
          </p>
          <Button asChild>
            <Link href="/focus-rooms">Back to Focus Rooms</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/focus-rooms">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate max-w-[200px]">
                {room.name}
              </h1>
              {room.isPublic ? (
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Invite Code */}
            {(room.isOwner || room.isMember) && room.inviteCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="font-mono">{room.inviteCode}</span>
              </Button>
            )}

            {/* Leave/Delete */}
            {room.isOwner ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLeaveDialog(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl border p-8 text-center",
                getModeColor(room.currentMode),
              )}
            >
              {/* Mode Badge */}
              <Badge
                className={cn(
                  "mb-6 text-sm px-4 py-1",
                  room.currentMode === "focus" && "bg-red-500 text-white",
                  room.currentMode === "break" && "bg-green-500 text-white",
                )}
              >
                {room.currentMode === "focus" && (
                  <>
                    <Flame className="h-4 w-4 mr-1" />
                    Focus Session
                  </>
                )}
                {room.currentMode === "break" && (
                  <>
                    <Coffee className="h-4 w-4 mr-1" />
                    Break Time
                  </>
                )}
                {room.currentMode === "idle" && "Waiting to Start"}
              </Badge>

              {/* Timer Display */}
              <div className="text-8xl font-mono font-bold mb-6">
                {room.currentMode === "idle"
                  ? `${room.focusTime}:00`
                  : formatTime(currentTime)}
              </div>

              {/* Progress Bar */}
              {room.currentMode !== "idle" && (
                <div className="mb-8 max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}

              {/* Controls */}
              {canControl && (
                <div className="flex justify-center gap-4">
                  {room.currentMode === "idle" ? (
                    <>
                      <Button
                        size="lg"
                        onClick={() => handleStartSession("focus")}
                        disabled={isStarting}
                        className="gap-2 bg-red-500 hover:bg-red-600"
                      >
                        {isStarting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                        Start Focus
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleStartSession("break")}
                        disabled={isStarting}
                        className="gap-2"
                      >
                        <Coffee className="h-5 w-5" />
                        Start Break
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleStopSession}
                        className="gap-2"
                      >
                        <Pause className="h-5 w-5" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              )}

              {!canControl && room.currentMode === "idle" && (
                <p className="text-muted-foreground">
                  Waiting for the room owner to start a session...
                </p>
              )}
            </motion.div>

            {/* Room Info */}
            {room.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 rounded-xl border bg-card p-4"
              >
                <p className="text-muted-foreground">{room.description}</p>
              </motion.div>
            )}

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span>{room.focusTime}m focus</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-green-500" />
                <span>{room.breakTime}m break</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {room._count.members}/{room.maxMembers} members
                </span>
              </div>
            </motion.div>
          </div>

          {/* Members Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card"
          >
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({room._count.members})
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {room.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {member.role === "owner" && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {member.user.name ||
                          member.user.username ||
                          "Anonymous"}
                        {member.userId === session?.user?.id && (
                          <span className="text-muted-foreground ml-1">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Leave Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave &quot;{room.name}&quot;? You can
              rejoin later with the invite code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveRoom} disabled={isLeaving}>
              {isLeaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All members will be removed and the
              room will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

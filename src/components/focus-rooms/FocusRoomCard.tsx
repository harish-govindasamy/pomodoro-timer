"use client";

import { motion } from "framer-motion";
import {
  Users,
  Clock,
  Coffee,
  Play,
  Pause,
  Lock,
  Globe,
  Crown,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface FocusRoomMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

export interface FocusRoom {
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
  members?: FocusRoomMember[];
  _count?: {
    members: number;
    sessions?: number;
  };
  isMember?: boolean;
  isOwner?: boolean;
}

interface FocusRoomCardProps {
  room: FocusRoom;
  compact?: boolean;
  showActions?: boolean;
  onJoin?: () => void;
  onEnter?: () => void;
  isLoading?: boolean;
}

export function FocusRoomCard({
  room,
  compact = false,
  showActions = true,
  onJoin,
  onEnter,
  isLoading = false,
}: FocusRoomCardProps) {
  const memberCount = room._count?.members || room.members?.length || 0;
  const isFull = memberCount >= room.maxMembers;

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "focus":
        return "text-red-500 bg-red-500/10";
      case "break":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "focus":
        return <Play className="h-3.5 w-3.5" />;
      case "break":
        return <Coffee className="h-3.5 w-3.5" />;
      default:
        return <Pause className="h-3.5 w-3.5" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "focus":
        return "Focusing";
      case "break":
        return "On Break";
      default:
        return "Idle";
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

  // Calculate session progress if active
  const getSessionProgress = () => {
    if (!room.sessionStartedAt || room.currentMode === "idle") return 0;

    const startTime = new Date(room.sessionStartedAt).getTime();
    const now = Date.now();
    const elapsed = (now - startTime) / 1000 / 60; // minutes
    const duration =
      room.currentMode === "focus" ? room.focusTime : room.breakTime;

    return Math.min(100, (elapsed / duration) * 100);
  };

  const progress = getSessionProgress();

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all cursor-pointer",
          room.currentMode === "focus" && "border-red-500/30 bg-red-500/5"
        )}
        onClick={onEnter}
      >
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              getModeColor(room.currentMode)
            )}
          >
            {getModeIcon(room.currentMode)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{room.name}</span>
              {!room.isPublic && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>
                {memberCount}/{room.maxMembers}
              </span>
              <span>•</span>
              <span>{getModeLabel(room.currentMode)}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-all",
        room.currentMode === "focus" && "border-red-500/30 ring-1 ring-red-500/20"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{room.name}</h3>
              {room.isPublic ? (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Globe className="h-3 w-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
            </div>
            {room.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {room.description}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <Badge
            className={cn(
              "ml-2 gap-1",
              getModeColor(room.currentMode),
              "border-0"
            )}
          >
            {getModeIcon(room.currentMode)}
            {getModeLabel(room.currentMode)}
          </Badge>
        </div>
      </div>

      {/* Session Progress (if active) */}
      {room.currentMode !== "idle" && (
        <div className="px-4 py-2 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {room.currentMode === "focus" ? "Focus Session" : "Break Time"}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Room Info */}
      <div className="p-4 space-y-4">
        {/* Settings */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-red-500" />
            <span>{room.focusTime}m focus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coffee className="h-4 w-4 text-green-500" />
            <span>{room.breakTime}m break</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              {memberCount}/{room.maxMembers}
            </span>
          </div>
        </div>

        {/* Members Preview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Owner */}
            <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={room.owner.image || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(room.owner.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                <Crown className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            {/* Other Members */}
            {room.members?.slice(1, 4).map((member, index) => (
              <Avatar
                key={member.id}
                className={cn(
                  "h-8 w-8 border-2 border-background",
                  index > 0 && "-ml-2"
                )}
              >
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.user.name)}
                </AvatarFallback>
              </Avatar>
            ))}

            {memberCount > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium -ml-2 border-2 border-background">
                +{memberCount - 4}
              </div>
            )}
          </div>

          {/* Host Name */}
          <div className="text-sm text-muted-foreground">
            Hosted by{" "}
            <span className="font-medium text-foreground">
              {room.owner.name || room.owner.username || "Anonymous"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-4 pt-0">
          {room.isMember || room.isOwner ? (
            <Button className="w-full" onClick={onEnter} disabled={isLoading}>
              Enter Room
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : isFull ? (
            <Button className="w-full" disabled variant="outline">
              Room Full
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={onJoin}
              disabled={isLoading}
            >
              {isLoading ? "Joining..." : "Join Room"}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  CheckSquare,
  Target,
  ChevronUp,
  ChevronDown,
  Crown,
  Star,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  userImage: string | null;
  points: number;
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  tasksCompleted: number;
  streakDays: number;
}

export interface CurrentUserRank {
  rank: number;
  points: number;
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  tasksCompleted: number;
  streakDays: number;
}

export type LeaderboardType = "weekly" | "monthly" | "allTime";
export type SortField = "points" | "pomodorosCompleted" | "totalFocusMinutes" | "tasksCompleted" | "streakDays";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUser?: CurrentUserRank | null;
  currentUserId?: string;
  type: LeaderboardType;
  isLoading?: boolean;
  onTypeChange?: (type: LeaderboardType) => void;
}

export function LeaderboardTable({
  entries,
  currentUser,
  currentUserId,
  type,
  isLoading = false,
  onTypeChange,
}: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>("points");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    return (a[sortField] - b[sortField]) * multiplier;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const SortHeader = ({
    field,
    children,
    icon: Icon,
  }: {
    field: SortField;
    children: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span>{children}</span>
        {sortField === field && (
          sortDirection === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        )}
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Type Tabs Skeleton */}
        <Skeleton className="h-10 w-64" />

        {/* Table Skeleton */}
        <div className="border rounded-lg">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Leaderboard Type Tabs */}
      {onTypeChange && (
        <Tabs value={type} onValueChange={(v) => onTypeChange(v as LeaderboardType)}>
          <TabsList>
            <TabsTrigger value="weekly" className="gap-2">
              <Trophy className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <Star className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="allTime" className="gap-2">
              <Crown className="h-4 w-4" />
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Current User Card (if not in top 10) */}
      {currentUser && currentUser.rank > 10 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getRankBadgeClass(currentUser.rank)}>
                #{currentUser.rank}
              </Badge>
              <span className="font-medium">Your Position</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium">{currentUser.points}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-red-500" />
                <span>{currentUser.pomodorosCompleted}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{currentUser.streakDays}d</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>User</TableHead>
              <SortHeader field="points" icon={Star}>
                Points
              </SortHeader>
              <SortHeader field="pomodorosCompleted" icon={Target}>
                Pomodoros
              </SortHeader>
              <SortHeader field="totalFocusMinutes" icon={Clock}>
                Focus Time
              </SortHeader>
              <SortHeader field="tasksCompleted" icon={CheckSquare}>
                Tasks
              </SortHeader>
              <SortHeader field="streakDays" icon={Flame}>
                Streak
              </SortHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {sortedEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Trophy className="h-10 w-10 opacity-50" />
                      <p>No entries yet</p>
                      <p className="text-sm">Be the first to claim the top spot!</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedEntries.map((entry, index) => {
                  const isCurrentUser = currentUserId === entry.userId;

                  return (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group",
                        isCurrentUser && "bg-primary/5",
                        entry.rank <= 3 && "font-medium"
                      )}
                    >
                      {/* Rank */}
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {entry.rank <= 3 ? (
                            <div
                              className={cn(
                                "flex items-center justify-center h-8 w-8 rounded-full",
                                getRankBadgeClass(entry.rank)
                              )}
                            >
                              {getRankIcon(entry.rank)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">#{entry.rank}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* User */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={entry.userImage || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(entry.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-medium",
                              isCurrentUser && "text-primary"
                            )}>
                              {entry.userName || "Anonymous"}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Points */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{entry.points.toLocaleString()}</span>
                        </div>
                      </TableCell>

                      {/* Pomodoros */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-red-500" />
                          <span>{entry.pomodorosCompleted}</span>
                        </div>
                      </TableCell>

                      {/* Focus Time */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{formatTime(entry.totalFocusMinutes)}</span>
                        </div>
                      </TableCell>

                      {/* Tasks */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <CheckSquare className="h-4 w-4 text-green-500" />
                          <span>{entry.tasksCompleted}</span>
                        </div>
                      </TableCell>

                      {/* Streak */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Flame className={cn(
                            "h-4 w-4",
                            entry.streakDays >= 7 ? "text-orange-500" : "text-muted-foreground"
                          )} />
                          <span>{entry.streakDays}d</span>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Load More Button */}
      {entries.length >= 50 && (
        <div className="flex justify-center">
          <Button variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowLeft,
  Loader2,
  Crown,
  Medal,
  Star,
  Flame,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LeaderboardTable,
  LeaderboardEntry,
  CurrentUserRank,
  LeaderboardType,
} from "@/components/leaderboard/LeaderboardTable";

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: CurrentUserRank | null;
  meta: {
    type: string;
    period: string;
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [type, setType] = useState<LeaderboardType>("weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard(type);
  }, [type]);

  const fetchLeaderboard = async (leaderboardType: LeaderboardType) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/leaderboard?type=${leaderboardType}&limit=50`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (newType: LeaderboardType) => {
    setType(newType);
  };

  // Get top 3 for podium display
  const topThree = data?.leaderboard.slice(0, 3) || [];

  const getPeriodLabel = () => {
    switch (type) {
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "allTime":
        return "All Time";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Leaderboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {getPeriodLabel()}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section with Top 3 Podium */}
        {!isLoading && topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-linear-to-r from-primary/10 via-yellow-500/10 to-primary/10 rounded-2xl p-8 border">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Top Performers</h2>
                <p className="text-muted-foreground">
                  {getPeriodLabel()}&apos;s Champions
                </p>
              </div>

              {/* Podium */}
              <div className="flex items-end justify-center gap-4 md:gap-8">
                {/* Second Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-r from-gray-300 to-gray-400 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-gray-300/50">
                      {topThree[1]?.userName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gray-400 rounded-full p-1">
                      <Medal className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 font-medium text-sm truncate max-w-[100px]">
                    {topThree[1]?.userName || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[1]?.points} pts
                  </p>
                  <div className="w-20 md:w-24 h-20 bg-linear-to-t from-gray-300 to-gray-200 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-600">2</span>
                  </div>
                </motion.div>

                {/* First Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-400/30">
                      {topThree[0]?.userName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Crown className="h-8 w-8 text-yellow-500 drop-shadow-lg" />
                    </div>
                  </div>
                  <p className="mt-3 font-semibold truncate max-w-[120px]">
                    {topThree[0]?.userName || "Anonymous"}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {topThree[0]?.points} pts
                  </p>
                  <div className="w-24 md:w-28 h-28 bg-linear-to-t from-yellow-400 to-amber-300 rounded-t-lg mt-2 flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-yellow-700">
                      1
                    </span>
                  </div>
                </motion.div>

                {/* Third Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-amber-500/50">
                      {topThree[2]?.userName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-amber-600 rounded-full p-1">
                      <Medal className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 font-medium text-sm truncate max-w-[100px]">
                    {topThree[2]?.userName || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[2]?.points} pts
                  </p>
                  <div className="w-20 md:w-24 h-16 bg-linear-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-3xl font-bold text-amber-800">3</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        {data?.currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card rounded-xl p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Your Rank</span>
              </div>
              <p className="text-2xl font-bold">#{data.currentUser.rank}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                <span className="text-sm">Your Points</span>
              </div>
              <p className="text-2xl font-bold">{data.currentUser.points}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-sm">Your Streak</span>
              </div>
              <p className="text-2xl font-bold">
                {data.currentUser.streakDays}d
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Competitors</span>
              </div>
              <p className="text-2xl font-bold">{data.meta.total}</p>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {error ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Failed to load leaderboard
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchLeaderboard(type)}>Try Again</Button>
            </div>
          ) : (
            <LeaderboardTable
              entries={data?.leaderboard || []}
              currentUser={data?.currentUser}
              currentUserId={session?.user?.id}
              type={type}
              isLoading={isLoading}
              onTypeChange={handleTypeChange}
            />
          )}
        </motion.div>

        {/* Not signed in prompt */}
        {status === "unauthenticated" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center"
          >
            <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              Join the Competition!
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign in to track your progress and compete with others
            </p>
            <Button asChild>
              <Link href="/auth/signin?callbackUrl=/leaderboard">
                Sign In to Compete
              </Link>
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

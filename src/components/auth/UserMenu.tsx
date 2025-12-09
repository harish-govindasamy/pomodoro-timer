"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Settings,
  Trophy,
  BarChart3,
  Users,
  LogOut,
  LogIn,
  Loader2,
  Crown,
  Flame,
} from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/signin">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/signup">Get Started</Link>
        </Button>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={session.user.image || undefined}
              alt={session.user.name || "User avatar"}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || "User avatar"}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate max-w-[180px]">
                {session.user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Stats Quick View */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-medium">5 day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-medium">#12</span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/statistics" className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Statistics</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/achievements" className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            <span>Achievements</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/focus-rooms" className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <span>Focus Rooms</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

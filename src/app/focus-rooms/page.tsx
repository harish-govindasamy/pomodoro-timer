"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  Globe,
  Lock,
  Copy,
  Check,
  Clock,
  Coffee,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FocusRoomCard,
  FocusRoom,
} from "@/components/focus-rooms/FocusRoomCard";
import { useToast } from "@/hooks/use-toast";

export default function FocusRoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [myRooms, setMyRooms] = useState<FocusRoom[]>([]);
  const [publicRooms, setPublicRooms] = useState<FocusRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my");
  const [searchQuery, setSearchQuery] = useState("");

  // Create room dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    isPublic: false,
    maxMembers: 10,
    focusTime: 25,
    breakTime: 5,
  });

  // Join room dialog state
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRooms();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);

      const [myRes, publicRes] = await Promise.all([
        fetch("/api/focus-rooms?type=my"),
        fetch("/api/focus-rooms?type=public"),
      ]);

      if (myRes.ok) {
        const data = await myRes.json();
        setMyRooms(data.rooms || []);
      }

      if (publicRes.ok) {
        const data = await publicRes.json();
        setPublicRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load focus rooms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch("/api/focus-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newRoom,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create room");
      }

      const { room } = await response.json();

      toast({
        title: "Room Created!",
        description: `Your room "${room.name}" is ready. Invite code: ${room.inviteCode}`,
      });

      setIsCreateDialogOpen(false);
      setNewRoom({
        name: "",
        description: "",
        isPublic: false,
        maxMembers: 10,
        focusTime: 25,
        breakTime: 5,
      });

      // Refresh rooms list
      fetchRooms();

      // Navigate to the new room
      router.push(`/focus-rooms/${room.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsJoining(true);

      const response = await fetch("/api/focus-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          inviteCode: inviteCode.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join room");
      }

      const { room } = await response.json();

      toast({
        title: "Joined Room!",
        description: `You've joined "${room.name}"`,
      });

      setIsJoinDialogOpen(false);
      setInviteCode("");

      // Navigate to the room
      router.push(`/focus-rooms/${room.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to join room",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinPublicRoom = async (roomId: string) => {
    try {
      // For public rooms, we need to get the invite code first
      const response = await fetch(`/api/focus-rooms?id=${roomId}`);
      if (!response.ok) throw new Error("Failed to get room details");

      const { room } = await response.json();

      if (room.isMember || room.isOwner) {
        router.push(`/focus-rooms/${roomId}`);
        return;
      }

      // Join the room
      const joinResponse = await fetch("/api/focus-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          inviteCode: room.inviteCode,
        }),
      });

      if (!joinResponse.ok) {
        const error = await joinResponse.json();
        throw new Error(error.error || "Failed to join room");
      }

      toast({
        title: "Joined Room!",
        description: `You've joined "${room.name}"`,
      });

      router.push(`/focus-rooms/${roomId}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to join room",
        variant: "destructive",
      });
    }
  };

  const handleEnterRoom = (roomId: string) => {
    router.push(`/focus-rooms/${roomId}`);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter rooms based on search query
  const filteredMyRooms = myRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPublicRooms = publicRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Loading state
  if (isLoading && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading focus rooms...</p>
        </div>
      </div>
    );
  }

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
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Focus Rooms</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Join Room Button */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Join with Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Focus Room</DialogTitle>
                  <DialogDescription>
                    Enter the invite code shared by the room owner
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      placeholder="Enter 8-character code"
                      value={inviteCode}
                      onChange={(e) =>
                        setInviteCode(e.target.value.toUpperCase())
                      }
                      maxLength={8}
                      className="font-mono text-center text-lg tracking-widest"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsJoinDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleJoinRoom} disabled={isJoining}>
                    {isJoining && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Join Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Room Button */}
            {status === "authenticated" && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a Focus Room</DialogTitle>
                    <DialogDescription>
                      Create a room to focus together with friends or the
                      community
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Room Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Room Name</Label>
                      <Input
                        id="name"
                        placeholder="My Focus Room"
                        value={newRoom.name}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, name: e.target.value })
                        }
                        maxLength={100}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="What are you working on?"
                        value={newRoom.description}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            description: e.target.value,
                          })
                        }
                        maxLength={500}
                        rows={2}
                      />
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Public Room</Label>
                        <p className="text-xs text-muted-foreground">
                          Anyone can find and join this room
                        </p>
                      </div>
                      <Switch
                        checked={newRoom.isPublic}
                        onCheckedChange={(checked) =>
                          setNewRoom({ ...newRoom, isPublic: checked })
                        }
                      />
                    </div>

                    {/* Max Members */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Max Members</Label>
                        <span className="text-sm text-muted-foreground">
                          {newRoom.maxMembers}
                        </span>
                      </div>
                      <Slider
                        value={[newRoom.maxMembers]}
                        onValueChange={([value]) =>
                          setNewRoom({ ...newRoom, maxMembers: value })
                        }
                        min={2}
                        max={50}
                        step={1}
                      />
                    </div>

                    {/* Timer Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-red-500" />
                          <Label>Focus Time</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[newRoom.focusTime]}
                            onValueChange={([value]) =>
                              setNewRoom({ ...newRoom, focusTime: value })
                            }
                            min={5}
                            max={120}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm w-12 text-right">
                            {newRoom.focusTime}m
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Coffee className="h-4 w-4 text-green-500" />
                          <Label>Break Time</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[newRoom.breakTime]}
                            onValueChange={([value]) =>
                              setNewRoom({ ...newRoom, breakTime: value })
                            }
                            min={1}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm w-12 text-right">
                            {newRoom.breakTime}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRoom} disabled={isCreating}>
                      {isCreating && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Room
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Not authenticated prompt */}
        {status === "unauthenticated" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center"
          >
            <Users className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Focus Together</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to create focus rooms and study with others
            </p>
            <Button asChild>
              <Link href="/auth/signin?callbackUrl=/focus-rooms">
                Sign In to Get Started
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="my" className="gap-2">
              <Lock className="h-4 w-4" />
              My Rooms
              {myRooms.length > 0 && (
                <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {myRooms.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="public" className="gap-2">
              <Globe className="h-4 w-4" />
              Public Rooms
              {publicRooms.length > 0 && (
                <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {publicRooms.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* My Rooms */}
          <TabsContent value="my">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMyRooms.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchQuery ? "No rooms match your search" : "No rooms yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create a room or join one with an invite code"}
                </p>
                {!searchQuery && status === "authenticated" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Room
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredMyRooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <FocusRoomCard
                        room={{ ...room, isMember: true }}
                        onEnter={() => handleEnterRoom(room.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Public Rooms */}
          <TabsContent value="public">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPublicRooms.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchQuery
                    ? "No public rooms match your search"
                    : "No public rooms available"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term"
                    : "Be the first to create a public room!"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredPublicRooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <FocusRoomCard
                        room={room}
                        onJoin={() => handleJoinPublicRoom(room.id)}
                        onEnter={() => handleEnterRoom(room.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Achievement, RARITY_CONFIG } from "@/types/achievement";
import { cn } from "@/lib/utils";

interface AchievementUnlockNotificationProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export function AchievementUnlockNotification({
  achievement,
  isOpen,
  onClose,
  autoCloseDelay = 5000,
}: AchievementUnlockNotificationProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number; size: number }>
  >([]);

  // Generate celebration particles
  useEffect(() => {
    if (isOpen && achievement) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);
    }
  }, [isOpen, achievement]);

  // Auto close after delay
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!achievement) return null;

  const rarityConfig = RARITY_CONFIG[achievement.rarity];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Notification Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="pointer-events-auto relative">
              {/* Particle Effects */}
              <div className="absolute inset-0 overflow-visible">
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{
                      opacity: 1,
                      x: "50%",
                      y: "50%",
                      scale: 0,
                    }}
                    animate={{
                      opacity: [1, 1, 0],
                      x: `${particle.x}%`,
                      y: `${particle.y}%`,
                      scale: [0, 1.5, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: particle.delay,
                      ease: "easeOut",
                    }}
                    className="absolute"
                    style={{
                      width: particle.size,
                      height: particle.size,
                    }}
                  >
                    {particle.id % 3 === 0 ? (
                      <Star
                        className="w-full h-full text-yellow-400"
                        fill="currentColor"
                      />
                    ) : particle.id % 3 === 1 ? (
                      <Sparkles className="w-full h-full text-primary" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-linear-to-r from-primary to-yellow-400" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Main Card */}
              <motion.div
                className={cn(
                  "relative w-[340px] max-w-[90vw] rounded-2xl border-2 p-6 shadow-2xl",
                  rarityConfig.bgColor,
                  rarityConfig.borderColor,
                  "bg-background/95 backdrop-blur-xl",
                )}
              >
                {/* Glow Effect for Legendary */}
                {achievement.rarity === "legendary" && (
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-2xl bg-linear-to-r from-amber-400/30 via-yellow-400/30 to-amber-400/30 blur-xl"
                  />
                )}

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Content */}
                <div className="relative flex flex-col items-center text-center">
                  {/* Title Badge */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                      Achievement Unlocked!
                    </span>
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.3,
                    }}
                    className={cn(
                      "relative flex items-center justify-center h-24 w-24 rounded-2xl mb-4",
                      rarityConfig.bgColor,
                      "ring-4",
                      achievement.rarity === "legendary"
                        ? "ring-amber-400/50"
                        : achievement.rarity === "epic"
                          ? "ring-purple-400/50"
                          : achievement.rarity === "rare"
                            ? "ring-blue-400/50"
                            : "ring-gray-400/30",
                    )}
                  >
                    {/* Rotating Ring for Legendary */}
                    {achievement.rarity === "legendary" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-400/50"
                      />
                    )}
                    <span className="text-5xl">{achievement.icon}</span>
                  </motion.div>

                  {/* Achievement Name */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl font-bold mb-2"
                  >
                    {achievement.name}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground mb-4"
                  >
                    {achievement.description}
                  </motion.p>

                  {/* Points & Rarity */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3"
                  >
                    {/* Points Badge */}
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold",
                        rarityConfig.bgColor,
                        rarityConfig.textColor,
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>+{achievement.points} Points</span>
                    </div>

                    {/* Rarity Badge */}
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium",
                        rarityConfig.bgColor,
                        rarityConfig.textColor,
                      )}
                    >
                      {rarityConfig.label}
                    </div>
                  </motion.div>

                  {/* Share Button (Optional) */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onClose}
                    >
                      Continue
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    if (isOpen) {
      // Add to queue if already showing one
      setQueue((prev) => [...prev, achievement]);
    } else {
      setCurrentAchievement(achievement);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Show next in queue after a short delay
    setTimeout(() => {
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setQueue(rest);
        setCurrentAchievement(next);
        setIsOpen(true);
      } else {
        setCurrentAchievement(null);
      }
    }, 300);
  };

  return {
    isOpen,
    currentAchievement,
    showAchievement,
    handleClose,
    queueLength: queue.length,
  };
}

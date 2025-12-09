import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================
  // SEED ACHIEVEMENTS
  // ============================================
  console.log("📀 Seeding achievements...");

  const achievements = [
    // Pomodoro achievements
    {
      code: "first_pomodoro",
      name: "First Focus",
      description: "Complete your first pomodoro session",
      icon: "🍅",
      category: "pomodoros",
      requirement: 1,
      rarity: "common",
      points: 10,
      order: 1,
    },
    {
      code: "pomodoro_10",
      name: "Getting Started",
      description: "Complete 10 pomodoro sessions",
      icon: "🌱",
      category: "pomodoros",
      requirement: 10,
      rarity: "common",
      points: 25,
      order: 2,
    },
    {
      code: "pomodoro_50",
      name: "Focus Apprentice",
      description: "Complete 50 pomodoro sessions",
      icon: "🎯",
      category: "pomodoros",
      requirement: 50,
      rarity: "rare",
      points: 50,
      order: 3,
    },
    {
      code: "pomodoro_100",
      name: "Centurion",
      description: "Complete 100 pomodoro sessions",
      icon: "💯",
      category: "pomodoros",
      requirement: 100,
      rarity: "rare",
      points: 100,
      order: 4,
    },
    {
      code: "pomodoro_500",
      name: "Focus Master",
      description: "Complete 500 pomodoro sessions",
      icon: "🏆",
      category: "pomodoros",
      requirement: 500,
      rarity: "epic",
      points: 250,
      order: 5,
    },
    {
      code: "pomodoro_1000",
      name: "Legendary Focus",
      description: "Complete 1,000 pomodoro sessions",
      icon: "👑",
      category: "pomodoros",
      requirement: 1000,
      rarity: "legendary",
      points: 500,
      order: 6,
    },

    // Streak achievements
    {
      code: "streak_3",
      name: "Three's a Charm",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      category: "streaks",
      requirement: 3,
      rarity: "common",
      points: 15,
      order: 1,
    },
    {
      code: "streak_7",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "📅",
      category: "streaks",
      requirement: 7,
      rarity: "rare",
      points: 50,
      order: 2,
    },
    {
      code: "streak_14",
      name: "Fortnight Focus",
      description: "Maintain a 14-day streak",
      icon: "⚡",
      category: "streaks",
      requirement: 14,
      rarity: "rare",
      points: 100,
      order: 3,
    },
    {
      code: "streak_30",
      name: "Monthly Master",
      description: "Maintain a 30-day streak",
      icon: "🌟",
      category: "streaks",
      requirement: 30,
      rarity: "epic",
      points: 200,
      order: 4,
    },
    {
      code: "streak_100",
      name: "Unstoppable",
      description: "Maintain a 100-day streak",
      icon: "💎",
      category: "streaks",
      requirement: 100,
      rarity: "legendary",
      points: 500,
      order: 5,
    },
    {
      code: "streak_365",
      name: "Year of Focus",
      description: "Maintain a 365-day streak",
      icon: "🏅",
      category: "streaks",
      requirement: 365,
      rarity: "legendary",
      points: 1000,
      order: 6,
      isHidden: true,
    },

    // Task achievements
    {
      code: "task_first",
      name: "Task Starter",
      description: "Complete your first task",
      icon: "✅",
      category: "tasks",
      requirement: 1,
      rarity: "common",
      points: 10,
      order: 1,
    },
    {
      code: "task_10",
      name: "Task Tackler",
      description: "Complete 10 tasks",
      icon: "📋",
      category: "tasks",
      requirement: 10,
      rarity: "common",
      points: 25,
      order: 2,
    },
    {
      code: "task_50",
      name: "Productivity Pro",
      description: "Complete 50 tasks",
      icon: "🚀",
      category: "tasks",
      requirement: 50,
      rarity: "rare",
      points: 75,
      order: 3,
    },
    {
      code: "task_100",
      name: "Task Terminator",
      description: "Complete 100 tasks",
      icon: "⭐",
      category: "tasks",
      requirement: 100,
      rarity: "epic",
      points: 150,
      order: 4,
    },
    {
      code: "task_500",
      name: "Task Legend",
      description: "Complete 500 tasks",
      icon: "🎖️",
      category: "tasks",
      requirement: 500,
      rarity: "legendary",
      points: 400,
      order: 5,
    },

    // Time achievements (in hours)
    {
      code: "time_1h",
      name: "First Hour",
      description: "Accumulate 1 hour of focus time",
      icon: "⏱️",
      category: "time",
      requirement: 1,
      rarity: "common",
      points: 10,
      order: 1,
    },
    {
      code: "time_10h",
      name: "Time Investor",
      description: "Accumulate 10 hours of focus time",
      icon: "⏰",
      category: "time",
      requirement: 10,
      rarity: "common",
      points: 30,
      order: 2,
    },
    {
      code: "time_50h",
      name: "Deep Worker",
      description: "Accumulate 50 hours of focus time",
      icon: "🕐",
      category: "time",
      requirement: 50,
      rarity: "rare",
      points: 100,
      order: 3,
    },
    {
      code: "time_100h",
      name: "Time Master",
      description: "Accumulate 100 hours of focus time",
      icon: "⌛",
      category: "time",
      requirement: 100,
      rarity: "epic",
      points: 200,
      order: 4,
    },
    {
      code: "time_500h",
      name: "Time Legend",
      description: "Accumulate 500 hours of focus time",
      icon: "🕰️",
      category: "time",
      requirement: 500,
      rarity: "legendary",
      points: 500,
      order: 5,
    },

    // Special achievements
    {
      code: "early_bird",
      name: "Early Bird",
      description: "Complete a session before 7 AM",
      icon: "🌅",
      category: "special",
      requirement: 1,
      rarity: "rare",
      points: 50,
      order: 1,
      isHidden: true,
    },
    {
      code: "night_owl",
      name: "Night Owl",
      description: "Complete a session after 11 PM",
      icon: "🦉",
      category: "special",
      requirement: 1,
      rarity: "rare",
      points: 50,
      order: 2,
      isHidden: true,
    },
    {
      code: "weekend_warrior",
      name: "Weekend Warrior",
      description: "Complete 10 sessions on weekends",
      icon: "🎉",
      category: "special",
      requirement: 10,
      rarity: "rare",
      points: 75,
      order: 3,
    },
    {
      code: "perfect_week",
      name: "Perfect Week",
      description: "Complete your daily goal every day for a week",
      icon: "💪",
      category: "special",
      requirement: 7,
      rarity: "epic",
      points: 150,
      order: 4,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);

  // ============================================
  // SEED MOTIVATIONAL QUOTES
  // ============================================
  console.log("💬 Seeding quotes...");

  const quotes = [
    // Focus quotes
    {
      text: "The successful warrior is the average man, with laser-like focus.",
      author: "Bruce Lee",
      category: "focus",
    },
    {
      text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
      author: "Alexander Graham Bell",
      category: "focus",
    },
    {
      text: "It is during our darkest moments that we must focus to see the light.",
      author: "Aristotle",
      category: "focus",
    },
    {
      text: "The key to success is to focus on goals, not obstacles.",
      author: null,
      category: "focus",
    },
    {
      text: "Focus on being productive instead of busy.",
      author: "Tim Ferriss",
      category: "focus",
    },
    {
      text: "Where focus goes, energy flows.",
      author: "Tony Robbins",
      category: "focus",
    },
    {
      text: "Starve your distractions, feed your focus.",
      author: null,
      category: "focus",
    },

    // Motivation quotes
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "motivation",
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "motivation",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "motivation",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "motivation",
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      category: "motivation",
    },
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
      category: "motivation",
    },
    {
      text: "Your limitation—it's only your imagination.",
      author: null,
      category: "motivation",
    },
    {
      text: "Push yourself, because no one else is going to do it for you.",
      author: null,
      category: "motivation",
    },
    {
      text: "Great things never come from comfort zones.",
      author: null,
      category: "motivation",
    },
    {
      text: "Dream it. Wish it. Do it.",
      author: null,
      category: "motivation",
    },

    // Productivity quotes
    {
      text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
      author: "Paul J. Meyer",
      category: "productivity",
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "productivity",
    },
    {
      text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
      author: "Stephen King",
      category: "productivity",
    },
    {
      text: "Action is the foundational key to all success.",
      author: "Pablo Picasso",
      category: "productivity",
    },
    {
      text: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar",
      category: "productivity",
    },
    {
      text: "Either you run the day or the day runs you.",
      author: "Jim Rohn",
      category: "productivity",
    },

    // Break quotes
    {
      text: "Almost everything will work again if you unplug it for a few minutes, including you.",
      author: "Anne Lamott",
      category: "break",
    },
    {
      text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.",
      author: "Ralph Marston",
      category: "break",
    },
    {
      text: "Take rest; a field that has rested gives a bountiful crop.",
      author: "Ovid",
      category: "break",
    },
    {
      text: "Your calm mind is the ultimate weapon against your challenges.",
      author: "Bryant McGill",
      category: "break",
    },
    {
      text: "Sometimes the most productive thing you can do is relax.",
      author: "Mark Black",
      category: "break",
    },
    {
      text: "The time to relax is when you don't have time for it.",
      author: "Sydney J. Harris",
      category: "break",
    },
    {
      text: "Breaks are not a waste of time. They help you come back stronger.",
      author: null,
      category: "break",
    },
  ];

  for (const quote of quotes) {
    // Check if quote already exists to avoid duplicates
    const existing = await prisma.quote.findFirst({
      where: { text: quote.text },
    });

    if (!existing) {
      await prisma.quote.create({
        data: quote,
      });
    }
  }

  console.log(`✅ Seeded ${quotes.length} quotes`);

  // ============================================
  // DONE
  // ============================================
  console.log("");
  console.log("🎉 Database seeding completed successfully!");
  console.log("");
  console.log("Summary:");
  console.log(`  - ${achievements.length} achievements`);
  console.log(`  - ${quotes.length} motivational quotes`);
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

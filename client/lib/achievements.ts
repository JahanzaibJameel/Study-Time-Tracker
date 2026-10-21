import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTodayTotalMinutes,
  getAllTimeStats,
  getStreak,
  getSubjects,
} from "@/lib/storage";

const ACHIEVEMENTS_KEY = "@studybuddy_achievements";
const ACHIEVEMENT_PROGRESS_KEY = "@studybuddy_achievement_progress";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Feather icon name
  category: "streak" | "time" | "sessions" | "subjects" | "special";
  requirement: {
    type:
      | "streak_days"
      | "total_hours"
      | "total_sessions"
      | "daily_goal_met"
      | "subjects_count"
      | "perfect_week"
      | "early_bird"
      | "night_owl";
    value: number;
  };
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: "streak_3",
    name: "Getting Started",
    description: "Maintain a 3-day study streak",
    icon: "zap",
    category: "streak",
    requirement: { type: "streak_days", value: 3 },
    rarity: "common",
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day study streak",
    icon: "zap",
    category: "streak",
    requirement: { type: "streak_days", value: 7 },
    rarity: "common",
  },
  {
    id: "streak_14",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day study streak",
    icon: "flame",
    category: "streak",
    requirement: { type: "streak_days", value: 14 },
    rarity: "rare",
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day study streak",
    icon: "flame",
    category: "streak",
    requirement: { type: "streak_days", value: 30 },
    rarity: "epic",
  },
  {
    id: "streak_100",
    name: "Centurion",
    description: "Maintain a 100-day study streak",
    icon: "award",
    category: "streak",
    requirement: { type: "streak_days", value: 100 },
    rarity: "legendary",
  },

  // Total hours achievements
  {
    id: "hours_1",
    name: "First Hour",
    description: "Complete 1 hour of study",
    icon: "clock",
    category: "time",
    requirement: { type: "total_hours", value: 1 },
    rarity: "common",
  },
  {
    id: "hours_10",
    name: "Decade Scholar",
    description: "Complete 10 hours of study",
    icon: "clock",
    category: "time",
    requirement: { type: "total_hours", value: 10 },
    rarity: "common",
  },
  {
    id: "hours_50",
    name: "Half Century",
    description: "Complete 50 hours of study",
    icon: "clock",
    category: "time",
    requirement: { type: "total_hours", value: 50 },
    rarity: "rare",
  },
  {
    id: "hours_100",
    name: "Century Scholar",
    description: "Complete 100 hours of study",
    icon: "star",
    category: "time",
    requirement: { type: "total_hours", value: 100 },
    rarity: "epic",
  },
  {
    id: "hours_500",
    name: "Knowledge Seeker",
    description: "Complete 500 hours of study",
    icon: "star",
    category: "time",
    requirement: { type: "total_hours", value: 500 },
    rarity: "legendary",
  },

  // Total sessions achievements
  {
    id: "sessions_5",
    name: "Session Starter",
    description: "Complete 5 study sessions",
    icon: "check-circle",
    category: "sessions",
    requirement: { type: "total_sessions", value: 5 },
    rarity: "common",
  },
  {
    id: "sessions_25",
    name: "Quarter Century",
    description: "Complete 25 study sessions",
    icon: "check-circle",
    category: "sessions",
    requirement: { type: "total_sessions", value: 25 },
    rarity: "rare",
  },
  {
    id: "sessions_100",
    name: "Session Centurion",
    description: "Complete 100 study sessions",
    icon: "check-circle",
    category: "sessions",
    requirement: { type: "total_sessions", value: 100 },
    rarity: "epic",
  },

  // Subjects achievements
  {
    id: "subjects_3",
    name: "Polymath Beginner",
    description: "Add 3 subjects",
    icon: "book-open",
    category: "subjects",
    requirement: { type: "subjects_count", value: 3 },
    rarity: "common",
  },
  {
    id: "subjects_10",
    name: "Renaissance Scholar",
    description: "Add 10 subjects",
    icon: "book-open",
    category: "subjects",
    requirement: { type: "subjects_count", value: 10 },
    rarity: "rare",
  },

  // Special achievements
  {
    id: "daily_goal_5",
    name: "Goal Getter",
    description: "Meet your daily goal 5 times",
    icon: "target",
    category: "special",
    requirement: { type: "daily_goal_met", value: 5 },
    rarity: "common",
  },
  {
    id: "daily_goal_30",
    name: "Goal Crusher",
    description: "Meet your daily goal 30 times",
    icon: "target",
    category: "special",
    requirement: { type: "daily_goal_met", value: 30 },
    rarity: "rare",
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Study every day for a week",
    icon: "calendar",
    category: "special",
    requirement: { type: "perfect_week", value: 7 },
    rarity: "epic",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete a session before 8 AM",
    icon: "sunrise",
    category: "special",
    requirement: { type: "early_bird", value: 1 },
    rarity: "rare",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Complete a session after 10 PM",
    icon: "moon",
    category: "special",
    requirement: { type: "night_owl", value: 1 },
    rarity: "rare",
  },
];

// Rarity colors
export const RARITY_COLORS = {
  common: "#90D5A5", // Green
  rare: "#A8DADC", // Cyan
  epic: "#9B59B6", // Purple
  legendary: "#F39C12", // Gold
};

// Get achievement progress (0-1)
export function getAchievementProgress(
  achievement: Achievement,
  stats: {
    currentStreak: number;
    totalHours: number;
    totalSessions: number;
    subjectsCount: number;
    dailyGoalMetCount: number;
    perfectWeek: boolean;
    earlyBird: boolean;
    nightOwl: boolean;
  },
): number {
  const { requirement } = achievement;
  let current = 0;
  let target = requirement.value;

  switch (requirement.type) {
    case "streak_days":
      current = stats.currentStreak;
      break;
    case "total_hours":
      current = stats.totalHours;
      break;
    case "total_sessions":
      current = stats.totalSessions;
      break;
    case "subjects_count":
      current = stats.subjectsCount;
      break;
    case "daily_goal_met":
      current = stats.dailyGoalMetCount;
      break;
    case "perfect_week":
      current = stats.perfectWeek ? 7 : 0;
      break;
    case "early_bird":
      current = stats.earlyBird ? 1 : 0;
      break;
    case "night_owl":
      current = stats.nightOwl ? 1 : 0;
      break;
  }

  return Math.min(current / target, 1);
}

// Check if achievement is unlocked
export function isAchievementUnlocked(
  achievement: Achievement,
  stats: {
    currentStreak: number;
    totalHours: number;
    totalSessions: number;
    subjectsCount: number;
    dailyGoalMetCount: number;
    perfectWeek: boolean;
    earlyBird: boolean;
    nightOwl: boolean;
  },
): boolean {
  return getAchievementProgress(achievement, stats) >= 1;
}

// Save unlocked achievements
export async function saveUnlockedAchievements(
  achievementIds: string[],
): Promise<void> {
  try {
    const data = JSON.stringify(achievementIds);
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, data);
  } catch (error) {
    console.error("Failed to save achievements:", error);
  }
}

// Load unlocked achievements
export async function loadUnlockedAchievements(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Check and unlock new achievements
export async function checkAndUnlockAchievements(): Promise<string[]> {
  try {
    const unlocked = await loadUnlockedAchievements();

    // Gather current stats
    const [statsResult, streakResult, subjectsResult] = await Promise.all([
      getAllTimeStats(),
      getStreak(),
      getSubjects(),
    ]);

    if (!statsResult.ok || !streakResult.ok || !subjectsResult.ok) {
      return [];
    }

    const stats = statsResult.value;
    const streak = streakResult.value;
    const subjects = subjectsResult.value;

    // Get today's sessions to check early bird / night owl
    const { getTodaySessions } = await import("@/lib/storage");
    const todaySessionsResult = await getTodaySessions();
    const todaySessions = todaySessionsResult.ok
      ? todaySessionsResult.value
      : [];

    // Check early bird (before 8 AM) and night owl (after 10 PM)
    const now = new Date();
    const currentHour = now.getHours();
    const hasEarlyBird = todaySessions.some((s) => {
      const sessionHour = new Date(s.date).getHours();
      return sessionHour < 8;
    });
    const hasNightOwl = todaySessions.some((s) => {
      const sessionHour = new Date(s.date).getHours();
      return sessionHour >= 22;
    });

    // Check perfect week (7 consecutive days with study)
    // This is simplified - in reality you'd check streak data
    const perfectWeek = streak.currentStreak >= 7;

    // Get daily goal met count from settings (would need to track this separately)
    const { getSettings } = await import("@/lib/storage");
    const settingsResult = await getSettings();
    const dailyGoalMetCount = 0; // Would need persistent counter

    const currentStats = {
      currentStreak: streak.currentStreak,
      totalHours: stats.totalHours,
      totalSessions: stats.totalSessions,
      subjectsCount: subjects.length,
      dailyGoalMetCount,
      perfectWeek,
      earlyBird: hasEarlyBird,
      nightOwl: hasNightOwl,
    };

    const newlyUnlocked: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (
        !unlocked.includes(achievement.id) &&
        isAchievementUnlocked(achievement, currentStats)
      ) {
        unlocked.push(achievement.id);
        newlyUnlocked.push(achievement.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      await saveUnlockedAchievements(unlocked);
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("Failed to check achievements:", error);
    return [];
  }
}

// Hook for managing achievements
export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    [],
  );
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    const unlocked = await loadUnlockedAchievements();
    setUnlockedAchievements(unlocked);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const checkAchievements = useCallback(async () => {
    const newUnlocks = await checkAndUnlockAchievements();
    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks);
      const allUnlocked = await loadUnlockedAchievements();
      setUnlockedAchievements(allUnlocked);
    }
    return newUnlocks;
  }, []);

  const getProgress = useCallback((achievement: Achievement) => {
    // This would need current stats - simplified for now
    return 0;
  }, []);

  return {
    unlockedAchievements,
    newlyUnlocked,
    isLoading,
    checkAchievements,
    clearNewlyUnlocked: () => setNewlyUnlocked([]),
    getProgress,
  };
}

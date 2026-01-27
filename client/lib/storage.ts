import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const SUBJECTS_KEY = "@studybuddy_subjects";
const SESSIONS_KEY = "@studybuddy_sessions";
const STREAK_KEY = "@studybuddy_streak";
const SETTINGS_KEY = "@studybuddy_settings";

// Types for study data
export interface Subject {
  id: string;
  name: string;
  totalMinutes: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  duration: number; // in seconds
  date: string; // ISO date string
}

export interface StreakData {
  currentStreak: number;
  lastStudyDate: string | null;
}

export interface Settings {
  dailyGoalMinutes: number;
  darkMode: boolean;
}

// Motivational messages shown after completing a study session
export const motivationalMessages = [
  "Great work! Every minute counts toward your goals.",
  "You're building momentum! Keep it up!",
  "Fantastic session! Your dedication is inspiring.",
  "Well done! Consistency is the key to success.",
  "Amazing effort! You're one step closer to mastery.",
  "Excellent focus! Take a well-deserved break.",
  "You did it! Small steps lead to big achievements.",
  "Brilliant! Your future self will thank you.",
  "Outstanding! Knowledge is power.",
  "Superb session! You're making progress every day.",
];

// Get a random motivational message
export function getRandomMotivationalMessage(): string {
  const index = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[index];
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format time from seconds to MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Format minutes to human-readable string (e.g., "2h 34m")
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Check if a date is today
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Check if a date is yesterday
export function isYesterday(dateString: string): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

// Get date string for today (YYYY-MM-DD)
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Subjects CRUD operations
export async function getSubjects(): Promise<Subject[]> {
  try {
    const data = await AsyncStorage.getItem(SUBJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting subjects:", error);
    return [];
  }
}

export async function saveSubjects(subjects: Subject[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error("Error saving subjects:", error);
  }
}

export async function addSubject(name: string): Promise<Subject> {
  const subjects = await getSubjects();
  const newSubject: Subject = {
    id: generateId(),
    name: name.trim(),
    totalMinutes: 0,
    createdAt: new Date().toISOString(),
  };
  subjects.push(newSubject);
  await saveSubjects(subjects);
  return newSubject;
}

export async function updateSubjectTime(
  subjectId: string,
  additionalMinutes: number
): Promise<void> {
  const subjects = await getSubjects();
  const subject = subjects.find((s) => s.id === subjectId);
  if (subject) {
    subject.totalMinutes += additionalMinutes;
    await saveSubjects(subjects);
  }
}

export async function deleteSubject(subjectId: string): Promise<void> {
  const subjects = await getSubjects();
  const filtered = subjects.filter((s) => s.id !== subjectId);
  await saveSubjects(filtered);
}

// Sessions CRUD operations
export async function getSessions(): Promise<StudySession[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting sessions:", error);
    return [];
  }
}

export async function saveSessions(sessions: StudySession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving sessions:", error);
  }
}

export async function addSession(
  subjectId: string,
  subjectName: string,
  durationSeconds: number
): Promise<StudySession> {
  const sessions = await getSessions();
  const newSession: StudySession = {
    id: generateId(),
    subjectId,
    subjectName,
    duration: durationSeconds,
    date: new Date().toISOString(),
  };
  sessions.push(newSession);
  await saveSessions(sessions);

  // Update subject total time
  const minutes = Math.floor(durationSeconds / 60);
  await updateSubjectTime(subjectId, minutes);

  // Update streak
  await updateStreak();

  return newSession;
}

// Get today's sessions
export async function getTodaySessions(): Promise<StudySession[]> {
  const sessions = await getSessions();
  return sessions.filter((s) => isToday(s.date));
}

// Get today's total study time in minutes
export async function getTodayTotalMinutes(): Promise<number> {
  const todaySessions = await getTodaySessions();
  const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  return Math.floor(totalSeconds / 60);
}

// Streak operations
export async function getStreak(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(STREAK_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { currentStreak: 0, lastStudyDate: null };
  } catch (error) {
    console.error("Error getting streak:", error);
    return { currentStreak: 0, lastStudyDate: null };
  }
}

export async function updateStreak(): Promise<StreakData> {
  const streak = await getStreak();
  const today = getTodayString();

  if (streak.lastStudyDate === today) {
    // Already studied today, no change
    return streak;
  }

  if (streak.lastStudyDate && isYesterday(streak.lastStudyDate)) {
    // Studied yesterday, increment streak
    streak.currentStreak += 1;
  } else if (streak.lastStudyDate !== today) {
    // Missed a day or first time, reset to 1
    streak.currentStreak = 1;
  }

  streak.lastStudyDate = today;

  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (error) {
    console.error("Error saving streak:", error);
  }

  return streak;
}

// Settings operations
export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { dailyGoalMinutes: 120, darkMode: false };
  } catch (error) {
    console.error("Error getting settings:", error);
    return { dailyGoalMinutes: 120, darkMode: false };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Get stats for the last 7 days
export async function getWeeklyStats(): Promise<{ day: string; minutes: number }[]> {
  const sessions = await getSessions();
  const stats: { day: string; minutes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayMinutes = sessions
      .filter((s) => s.date.startsWith(dateStr))
      .reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);

    stats.push({ day: dayName, minutes: dayMinutes });
  }

  return stats;
}

// Get all-time stats
export async function getAllTimeStats(): Promise<{
  totalHours: number;
  totalSessions: number;
  currentStreak: number;
}> {
  const sessions = await getSessions();
  const streak = await getStreak();

  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.floor(totalSeconds / 3600);

  return {
    totalHours,
    totalSessions: sessions.length,
    currentStreak: streak.currentStreak,
  };
}

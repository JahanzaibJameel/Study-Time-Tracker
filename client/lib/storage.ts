import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  SUBJECTS: "@studybuddy_subjects",
  SESSIONS: "@studybuddy_sessions",
  STREAK: "@studybuddy_streak",
  SETTINGS: "@studybuddy_settings",
} as const;

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
  duration: number;
  date: string;
  notes?: string;
  tags?: string[];
}

export interface StreakData {
  currentStreak: number;
  lastStudyDate: string | null;
}

export interface Settings {
  dailyGoalMinutes: number;
  darkMode: boolean;
  accentColor: string;
  avatar: number;
  displayName: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  streakAlertEnabled: boolean;
  breakReminderEnabled: boolean;
  breakReminderInterval: number; // minutes
}

export interface HomeData {
  todayMinutes: number;
  streak: StreakData;
  todaySessions: (StudySession & { subjectName: string })[];
  settings: Settings;
}

export interface WeeklyStats {
  day: string;
  minutes: number;
}

export interface AllTimeStats {
  totalHours: number;
  totalSessions: number;
  currentStreak: number;
}

// Motivational messages shown after completing a study session
const MOTIVATIONAL_MESSAGES = [
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

// Generate unique ID using crypto.randomUUID (React Native 0.76+)
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older RN versions
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Get a random motivational message
export function getRandomMotivationalMessage(): string {
  const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
  return MOTIVATIONAL_MESSAGES[index];
}

// Generate unique ID
export function generateId(): string {
  return generateUUID();
}

// Format time from seconds to MM:SS or H:MM:SS
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Format minutes to human-readable string (e.g., "2h 34m", "45m", "30s")
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

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

// Check if a date is today (UTC comparison)
export function isToday(dateString: string): boolean {
  return dateString === getTodayString();
}

// Check if a date is yesterday (UTC comparison)
export function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  return dateString === yesterdayStr;
}

// Get date string for today (YYYY-MM-DD) in UTC
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Custom error class for storage operations
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

// Result type for consistent error handling
export type Result<T, E = StorageError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Mutex for atomic storage operations
let storageMutex: Promise<unknown> = Promise.resolve();

async function withStorageLock<T>(fn: () => Promise<T>): Promise<T> {
  const lock = storageMutex.then(fn);
  storageMutex = lock.catch(() => undefined);
  return lock as Promise<T>;
}

// Generic storage helpers
async function getFromStorage<T>(key: string, defaultValue: T): Promise<Result<T>> {
  try {
    const data = await AsyncStorage.getItem(key);
    return { ok: true, value: data ? JSON.parse(data) : defaultValue };
  } catch (error) {
    return {
      ok: false,
      error: new StorageError(`Failed to load data from ${key}`, "getFromStorage", error as Error),
    };
  }
}

async function saveToStorage<T>(key: string, value: T): Promise<Result<void>> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: new StorageError(`Failed to save data to ${key}`, "saveToStorage", error as Error),
    };
  }
}

// Subjects CRUD operations
export async function getSubjects(): Promise<Result<Subject[]>> {
  return getFromStorage(SUBJECTS_KEY, []);
}

export async function saveSubjects(subjects: Subject[]): Promise<Result<void>> {
  return saveToStorage(SUBJECTS_KEY, subjects);
}

export async function addSubject(name: string): Promise<Result<Subject>> {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { ok: false, error: new StorageError("Subject name cannot be empty", "addSubject") };
  }
  if (trimmed.length > 50) {
    return { ok: false, error: new StorageError("Subject name too long (max 50 chars)", "addSubject") };
  }

  const subjectsResult = await getSubjects();
  if (!subjectsResult.ok) return subjectsResult;

  const subjects = subjectsResult.value;
  const nameExists = subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  if (nameExists) {
    return { ok: false, error: new StorageError("Subject already exists", "addSubject") };
  }

  const newSubject: Subject = {
    id: generateId(),
    name: trimmed,
    totalMinutes: 0,
    createdAt: new Date().toISOString(),
  };

  subjects.push(newSubject);
  const saveResult = await saveSubjects(subjects);
  if (!saveResult.ok) return saveResult;

  return { ok: true, value: newSubject };
}

export async function updateSubjectTime(
  subjectId: string,
  additionalMinutes: number,
): Promise<Result<void>> {
  const subjectsResult = await getSubjects();
  if (!subjectsResult.ok) return subjectsResult;

  const subjects = subjectsResult.value;
  const subject = subjects.find((s) => s.id === subjectId);
  
  if (!subject) {
    return { ok: false, error: new StorageError("Subject not found", "updateSubjectTime") };
  }

  subject.totalMinutes += additionalMinutes;
  return saveSubjects(subjects);
}

export async function deleteSubject(subjectId: string): Promise<Result<void>> {
  const subjectsResult = await getSubjects();
  if (!subjectsResult.ok) return subjectsResult;

  const subjects = subjectsResult.value;
  const filtered = subjects.filter((s) => s.id !== subjectId);
  return saveSubjects(filtered);
}

// Sessions CRUD operations
export async function getSessions(): Promise<Result<StudySession[]>> {
  return getFromStorage(SESSIONS_KEY, []);
}

export async function saveSessions(sessions: StudySession[]): Promise<Result<void>> {
  return saveToStorage(SESSIONS_KEY, sessions);
}

export async function addSession(
  subjectId: string,
  subjectName: string,
  durationSeconds: number,
  notes?: string,
  tags?: string[],
): Promise<Result<StudySession>> {
  return withStorageLock(async () => {
    const [sessionsResult, subjectsResult, streakResult] = await Promise.all([
      getSessions(),
      getSubjects(),
      getStreak(),
    ]);

    if (!sessionsResult.ok) return sessionsResult;
    if (!subjectsResult.ok) return subjectsResult;
    if (!streakResult.ok) return streakResult;

    const sessions = sessionsResult.value;
    const subjects = subjectsResult.value;
    const streak = streakResult.value;

    const newSession: StudySession = {
      id: generateId(),
      subjectId,
      duration: durationSeconds,
      date: new Date().toISOString(),
      notes,
      tags,
    };

    sessions.push(newSession);

    const minutes = Math.floor(durationSeconds / 60);
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject) {
      subject.totalMinutes += minutes;
    }

    // Update streak
    const today = getTodayString();
    if (streak.lastStudyDate !== today) {
      if (streak.lastStudyDate && isYesterday(streak.lastStudyDate)) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }
      streak.lastStudyDate = today;
    }

    const [saveSessionsResult, saveSubjectsResult, saveStreakResult] = await Promise.all([
      saveSessions(sessions),
      saveSubjects(subjects),
      saveToStorage(STREAK_KEY, streak),
    ]);

    if (!saveSessionsResult.ok) return saveSessionsResult;
    if (!saveSubjectsResult.ok) return saveSubjectsResult;
    if (!saveStreakResult.ok) return saveStreakResult;

    return { ok: true, value: newSession };
  });
}

// Get today's sessions with subject names joined
export async function getTodaySessions(): Promise<Result<(StudySession & { subjectName: string })[]>> {
  const [sessionsResult, subjectsResult] = await Promise.all([
    getSessions(),
    getSubjects(),
  ]);

  if (!sessionsResult.ok) return sessionsResult;
  if (!subjectsResult.ok) return subjectsResult;

  const sessions = sessionsResult.value;
  const subjects = subjectsResult.value;
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const todaySessions = sessions
    .filter((s) => isToday(s.date))
    .map((s) => ({
      ...s,
      subjectName: subjectMap.get(s.subjectId) || "Unknown",
    }))
    .reverse();

  return { ok: true, value: todaySessions };
}

// Get today's total study time in minutes
export async function getTodayTotalMinutes(): Promise<Result<number>> {
  const sessionsResult = await getSessions();
  if (!sessionsResult.ok) return sessionsResult;

  const todaySessions = sessionsResult.value.filter((s) => isToday(s.date));
  const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  return { ok: true, value: Math.floor(totalSeconds / 60) };
}

// Streak operations
export async function getStreak(): Promise<Result<StreakData>> {
  const result = await getFromStorage<StreakData | null>(STREAK_KEY, null);
  if (!result.ok) return result;
  return { ok: true, value: result.value ?? { currentStreak: 0, lastStudyDate: null } };
}

export async function updateStreak(): Promise<Result<StreakData>> {
  const streakResult = await getStreak();
  if (!streakResult.ok) return streakResult;

  const streak = streakResult.value;
  const today = getTodayString();

  if (streak.lastStudyDate === today) {
    return { ok: true, value: streak };
  }

  if (streak.lastStudyDate && isYesterday(streak.lastStudyDate)) {
    streak.currentStreak += 1;
  } else if (streak.lastStudyDate !== today) {
    streak.currentStreak = 1;
  }

  streak.lastStudyDate = today;

  const saveResult = await saveToStorage(STREAK_KEY, streak);
  if (!saveResult.ok) return saveResult;
  return { ok: true, value: streak };
}

// Settings operations
export async function getSettings(): Promise<Result<Settings>> {
  const result = await getFromStorage<Settings | null>(SETTINGS_KEY, null);
  if (!result.ok) return result;
  
  const defaultSettings: Settings = {
    dailyGoalMinutes: 120,
    darkMode: false,
    accentColor: "#A8DADC",
    avatar: 1,
    displayName: "",
    dailyReminderEnabled: false,
    dailyReminderTime: "19:00",
    streakAlertEnabled: true,
    breakReminderEnabled: false,
    breakReminderInterval: 60,
  };
  
  return { ok: true, value: result.value ?? defaultSettings };
}

export async function saveSettings(settings: Settings): Promise<Result<void>> {
  return saveToStorage(SETTINGS_KEY, settings);
}

// Compound query for Home screen - single round trip
export async function getHomeData(): Promise<Result<HomeData>> {
  const [sessionsResult, streakResult, settingsResult, subjectsResult] = await Promise.all([
    getSessions(),
    getStreak(),
    getSettings(),
    getSubjects(),
  ]);

  if (!sessionsResult.ok) return sessionsResult;
  if (!streakResult.ok) return streakResult;
  if (!settingsResult.ok) return settingsResult;
  if (!subjectsResult.ok) return subjectsResult;

  const sessions = sessionsResult.value;
  const streak = streakResult.value;
  const settings = settingsResult.value;
  const subjects = subjectsResult.value;

  const todaySessions = sessions.filter((s) => isToday(s.date));
  const todayMinutes = Math.floor(
    todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60,
  );

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const todaySessionsWithNames = todaySessions
    .map((s) => ({
      ...s,
      subjectName: subjectMap.get(s.subjectId) || "Unknown",
    }))
    .reverse();

  return {
    ok: true,
    value: {
      todayMinutes,
      streak,
      todaySessions: todaySessionsWithNames,
      settings,
    },
  };
}

// Get stats for the last 7 days
export async function getWeeklyStats(): Promise<Result<WeeklyStats[]>> {
  const sessionsResult = await getSessions();
  if (!sessionsResult.ok) return sessionsResult;

  const sessions = sessionsResult.value;
  const stats: WeeklyStats[] = [];

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

  return { ok: true, value: stats };
}

// Get all-time stats
export async function getAllTimeStats(): Promise<Result<AllTimeStats>> {
  const [sessionsResult, streakResult] = await Promise.all([
    getSessions(),
    getStreak(),
  ]);

  if (!sessionsResult.ok) return sessionsResult;
  if (!streakResult.ok) return streakResult;

  const sessions = sessionsResult.value;
  const streak = streakResult.value;

  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.floor(totalSeconds / 3600);

  return {
    ok: true,
    value: {
      totalHours,
      totalSessions: sessions.length,
      currentStreak: streak.currentStreak,
    },
  };
}

// Export all data as JSON
export async function exportData(): Promise<Result<string>> {
  const [subjectsResult, sessionsResult, streakResult, settingsResult] =
    await Promise.all([
      getSubjects(),
      getSessions(),
      getStreak(),
      getSettings(),
    ]);

  if (!subjectsResult.ok) return subjectsResult;
  if (!sessionsResult.ok) return sessionsResult;
  if (!streakResult.ok) return streakResult;
  if (!settingsResult.ok) return settingsResult;

  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    subjects: subjectsResult.value,
    sessions: sessionsResult.value,
    streak: streakResult.value,
    settings: settingsResult.value,
  };

  return { ok: true, value: JSON.stringify(exportPayload, null, 2) };
}

// Import data from JSON
export async function importData(jsonString: string): Promise<Result<void>> {
  try {
    const data = JSON.parse(jsonString);

    if (!data.subjects || !data.sessions || !data.streak || !data.settings) {
      return { ok: false, error: new StorageError("Invalid import data format", "importData") };
    }

    const [
      saveSubjectsResult,
      saveSessionsResult,
      saveStreakResult,
      saveSettingsResult,
    ] = await Promise.all([
      saveSubjects(data.subjects),
      saveSessions(data.sessions),
      saveToStorage(STORAGE_KEYS.STREAK, data.streak),
      saveSettings(data.settings),
    ]);

    if (!saveSubjectsResult.ok) return saveSubjectsResult;
    if (!saveSessionsResult.ok) return saveSessionsResult;
    if (!saveStreakResult.ok) return saveStreakResult;
    if (!saveSettingsResult.ok) return saveSettingsResult;

    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: new StorageError("Failed to import data", "importData", error as Error),
    };
  }
}

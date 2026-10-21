// StudyBuddy Widget Configuration
// This file defines the widget configuration for iOS (WidgetKit) and Android (App Widgets)

export interface WidgetData {
  todayMinutes: number;
  dailyGoal: number;
  currentStreak: number;
  lastUpdated: string;
  subjectName?: string;
}

export const WIDGET_KINDS = {
  PROGRESS: "StudyBuddyProgressWidget",
  STREAK: "StudyBuddyStreakWidget",
  SUBJECT: "StudyBuddySubjectWidget",
} as const;

export type WidgetKind = (typeof WIDGET_KINDS)[keyof typeof WIDGET_KINDS];

// Shared data key for App Groups (iOS) / SharedPreferences (Android)
export const WIDGET_DATA_KEY = "studybuddy_widget_data";
export const APP_GROUP_ID = "group.com.studybuddy.widget";

// Default widget data
export const DEFAULT_WIDGET_DATA: WidgetData = {
  todayMinutes: 0,
  dailyGoal: 120,
  currentStreak: 0,
  lastUpdated: new Date().toISOString(),
};

// Widget sizes supported
export const WIDGET_SIZES = {
  iOS: ["small", "medium", "large"],
  Android: ["1x1", "2x1", "4x1", "4x2"],
} as const;

// Update frequency (minimum on iOS is ~15-30 min, Android can be more frequent)
export const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Color scheme for widgets (matches app theme)
export const WIDGET_COLORS = {
  light: {
    background: "#FFFFFF",
    primary: "#A8DADC",
    secondary: "#F1FAEE",
    text: "#1D3557",
    textSecondary: "#457B9D",
    success: "#90D5A5",
    warning: "#FFC857",
  },
  dark: {
    background: "#1D3557",
    primary: "#A8DADC",
    secondary: "#2D4564",
    text: "#F1FAEE",
    textSecondary: "#9BB5C4",
    success: "#90D5A5",
    warning: "#FFC857",
  },
};

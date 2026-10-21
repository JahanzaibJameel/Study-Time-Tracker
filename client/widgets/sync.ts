import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  WidgetData,
  DEFAULT_WIDGET_DATA,
  WIDGET_DATA_KEY,
  APP_GROUP_ID,
} from "./config";
import {
  getTodayTotalMinutes,
  getStreak,
  getSettings,
  getSubjects,
} from "@/lib/storage";

/**
 * Widget Data Sync Utility
 *
 * This module handles syncing app data to widgets.
 * On iOS: Uses App Groups for sharing data with WidgetKit extension
 * On Android: Uses SharedPreferences for App Widget updates
 * On Web: Uses localStorage (for PWA widgets)
 */

// Platform-specific storage
async function setWidgetData(data: WidgetData): Promise<void> {
  const json = JSON.stringify(data);

  if (Platform.OS === "ios") {
    // iOS: Use App Groups (requires native module)
    // This is a placeholder - actual implementation requires native code
    console.log("[Widget] iOS: Would write to App Group", APP_GROUP_ID, json);
  } else if (Platform.OS === "android") {
    // Android: Use SharedPreferences via native module
    // This is a placeholder - actual implementation requires native code
    console.log("[Widget] Android: Would write to SharedPreferences", json);
  } else {
    // Web: Use localStorage for PWA widgets
    try {
      await AsyncStorage.setItem(WIDGET_DATA_KEY, json);
    } catch (error) {
      console.error("[Widget] Failed to save widget data:", error);
    }
  }
}

async function getWidgetData(): Promise<WidgetData> {
  if (Platform.OS === "web") {
    try {
      const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
      return data ? JSON.parse(data) : DEFAULT_WIDGET_DATA;
    } catch {
      return DEFAULT_WIDGET_DATA;
    }
  }
  // Native platforms would read from native storage
  return DEFAULT_WIDGET_DATA;
}

/**
 * Sync current app data to widget
 * Call this after:
 * - Completing a study session
 * - Updating streak
 * - Changing daily goal
 * - App backgrounding
 */
export async function syncWidgetData(): Promise<void> {
  try {
    const [todayMinutesResult, streakResult, settingsResult, subjectsResult] =
      await Promise.all([
        getTodayTotalMinutes(),
        getStreak(),
        getSettings(),
        getSubjects(),
      ]);

    const todayMinutes = todayMinutesResult.ok ? todayMinutesResult.value : 0;
    const streak = streakResult.ok
      ? streakResult.value
      : { currentStreak: 0, lastStudyDate: null };
    const settings = settingsResult.ok
      ? settingsResult.value
      : { dailyGoalMinutes: 120 };
    const subjects = subjectsResult.ok ? subjectsResult.value : [];

    // Get most recent subject for subject widget
    let subjectName: string | undefined;
    if (subjects.length > 0) {
      // Sort by totalMinutes descending
      const sorted = [...subjects].sort(
        (a, b) => b.totalMinutes - a.totalMinutes,
      );
      subjectName = sorted[0]?.name;
    }

    const widgetData: WidgetData = {
      todayMinutes,
      dailyGoal: settings.dailyGoalMinutes,
      currentStreak: streak.currentStreak,
      lastUpdated: new Date().toISOString(),
      subjectName,
    };

    await setWidgetData(widgetData);

    if (__DEV__) {
      console.log("[Widget] Synced data:", widgetData);
    }
  } catch (error) {
    console.error("[Widget] Failed to sync widget data:", error);
  }
}

/**
 * Force widget update (for native platforms with background updates)
 * On iOS: Uses WidgetCenter.shared.reloadTimelines()
 * On Android: Uses AppWidgetManager.updateAppWidget()
 */
export async function refreshWidget(): Promise<void> {
  await syncWidgetData();

  if (Platform.OS === "ios") {
    // iOS: Requires native module to call WidgetCenter.shared.reloadTimelines()
    console.log("[Widget] iOS: Would reload widget timelines");
  } else if (Platform.OS === "android") {
    // Android: Requires native module to call AppWidgetManager.updateAppWidget()
    console.log("[Widget] Android: Would update app widgets");
  }
}

/**
 * Initialize widget data on app startup
 */
export async function initializeWidget(): Promise<void> {
  await syncWidgetData();
}

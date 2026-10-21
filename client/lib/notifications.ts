import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getSettings, Settings } from "@/lib/storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  streakAlertEnabled: boolean;
  breakReminderEnabled: boolean;
  breakReminderInterval: number; // minutes
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: false,
  dailyReminderTime: "19:00", // 7 PM
  streakAlertEnabled: true,
  breakReminderEnabled: false,
  breakReminderInterval: 60,
};

const NOTIFICATION_SETTINGS_KEY = "@studybuddy_notification_settings";

// Get notification settings from AsyncStorage
async function getStoredNotificationSettings(): Promise<NotificationSettings | null> {
  try {
    const { getSettings: getStorageSettings } = await import("@/lib/storage");
    const result = await getStorageSettings();
    if (result.ok && result.value) {
      return {
        dailyReminderEnabled: result.value.dailyReminderEnabled ?? false,
        dailyReminderTime: result.value.dailyReminderTime ?? "19:00",
        streakAlertEnabled: result.value.streakAlertEnabled ?? true,
        breakReminderEnabled: result.value.breakReminderEnabled ?? false,
        breakReminderInterval: result.value.breakReminderInterval ?? 60,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Save notification settings to AsyncStorage
async function saveStoredNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  try {
    const {
      getSettings: getStorageSettings,
      saveSettings: saveStorageSettings,
    } = await import("@/lib/storage");
    const result = await getStorageSettings();
    if (result.ok) {
      const updatedSettings: Settings = {
        ...result.value,
        dailyReminderEnabled: settings.dailyReminderEnabled,
        dailyReminderTime: settings.dailyReminderTime,
        streakAlertEnabled: settings.streakAlertEnabled,
        breakReminderEnabled: settings.breakReminderEnabled,
        breakReminderInterval: settings.breakReminderInterval,
      };
      await saveStorageSettings(updatedSettings);
    }
  } catch (error) {
    console.error("Failed to save notification settings:", error);
  }
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log("Notifications only work on physical device");
    return false;
  }

  const existingStatus = (await Notifications.getPermissionsAsync()) as {
    granted: boolean;
  };
  let finalStatus = existingStatus.granted;

  if (!existingStatus.granted) {
    const { granted } = (await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    })) as { granted: boolean };
    finalStatus = granted;
  }

  if (!finalStatus) {
    console.log("Notification permissions not granted");
    return false;
  }

  // Configure Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "StudyBuddy",
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A8DADC",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Study Reminders",
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A8DADC",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("streak", {
      name: "Streak Alerts",
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFC857",
      sound: "default",
    });
  }

  return true;
}

// Schedule daily study reminder
export async function scheduleDailyReminder(
  time: string,
): Promise<string | null> {
  const [hours, minutes] = time.split(":").map(Number);

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Study! 📚",
        body: "Your daily study session is waiting. Keep your streak alive!",
        sound: "default",
        data: { type: "daily_reminder" },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
      identifier: "daily-reminder",
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule daily reminder:", error);
    return null;
  }
}

// Cancel daily reminder
export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync("daily-reminder");
  } catch (error) {
    console.error("Failed to cancel daily reminder:", error);
  }
}

// Schedule streak alert (if no study today and it's evening)
export async function scheduleStreakAlert(): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak Alert! 🔥",
        body: "You haven't studied today. Complete a session to keep your streak!",
        sound: "default",
        data: { type: "streak_alert" },
      },
      trigger: {
        hour: 20, // 8 PM
        minute: 0,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
      identifier: "streak-alert",
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule streak alert:", error);
    return null;
  }
}

// Cancel streak alert
export async function cancelStreakAlert(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync("streak-alert");
  } catch (error) {
    console.error("Failed to cancel streak alert:", error);
  }
}

// Schedule break reminder during long sessions
export async function scheduleBreakReminder(
  intervalMinutes: number,
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Break Time! ☕",
        body: `You've been studying for ${intervalMinutes} minutes. Time for a short break!`,
        sound: "default",
        data: { type: "break_reminder" },
      },
      trigger: {
        seconds: intervalMinutes * 60,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
      identifier: "break-reminder",
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule break reminder:", error);
    return null;
  }
}

// Cancel break reminder
export async function cancelBreakReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync("break-reminder");
  } catch (error) {
    console.error("Failed to cancel break reminder:", error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to cancel all notifications:", error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to get scheduled notifications:", error);
    return [];
  }
}

// Handle notification response (when user taps notification)
export function addNotificationResponseListener(
  listener: (response: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

// Initialize notifications on app startup
export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const settings = await getStoredNotificationSettings();
  if (!settings) return;

  if (settings.dailyReminderEnabled) {
    await scheduleDailyReminder(settings.dailyReminderTime);
  }

  if (settings.streakAlertEnabled) {
    await scheduleStreakAlert();
  }

  if (settings.breakReminderEnabled) {
    await scheduleBreakReminder(settings.breakReminderInterval);
  }
}

// Update all notifications based on current settings
export async function updateAllNotifications(
  settings: NotificationSettings,
): Promise<void> {
  await cancelAllNotifications();

  if (settings.dailyReminderEnabled) {
    await scheduleDailyReminder(settings.dailyReminderTime);
  }

  if (settings.streakAlertEnabled) {
    await scheduleStreakAlert();
  }

  if (settings.breakReminderEnabled) {
    await scheduleBreakReminder(settings.breakReminderInterval);
  }
}

// Check if we should show streak alert (no study today, evening time)
export async function checkAndShowStreakAlert(): Promise<void> {
  try {
    const settings = await getSettings();
    if (!settings.ok) return;

    const notificationSettings = await getStoredNotificationSettings();
    if (!notificationSettings?.streakAlertEnabled) return;

    // Check if already studied today
    const { getTodayTotalMinutes } = await import("@/lib/storage");
    const todayMinutesResult = await getTodayTotalMinutes();
    if (!todayMinutesResult.ok || todayMinutesResult.value > 0) return;

    // Check if it's evening (after 6 PM)
    const hour = new Date().getHours();
    if (hour < 18) return;

    // Show immediate notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak Alert! 🔥",
        body: "You haven't studied today. Complete a session to keep your streak!",
        sound: "default",
        data: { type: "streak_alert" },
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error("Failed to check streak alert:", error);
  }
}

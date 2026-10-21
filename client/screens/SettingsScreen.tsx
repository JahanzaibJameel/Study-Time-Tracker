import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  getSettings,
  saveSettings,
  exportData,
  importData,
  Settings,
} from "@/lib/storage";
import {
  initializeNotifications,
  updateAllNotifications,
} from "@/lib/notifications";
import { Feather } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SuccessAnimation } from "@/components/LottieAnimations";

const ACCENT_COLORS = [
  { name: "Cyan", value: "#A8DADC" },
  { name: "Green", value: "#90D5A5" },
  { name: "Pink", value: "#F5B7D1" },
];

function SettingToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.settingToggleRow}>
      <View style={styles.settingInfo}>
        <ThemedText type="body" style={styles.settingLabel}>
          {label}
        </ThemedText>
        <ThemedText type="small" style={styles.settingDescription}>
          {description}
        </ThemedText>
      </View>
      <Pressable
        onPress={() => onChange(!value)}
        style={({ pressed }) => [
          styles.toggleTrack,
          {
            backgroundColor: value ? theme.primary : theme.border,
          },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityHint={value ? "Tap to disable" : "Tap to enable"}
      >
        <ThemedView
          style={[
            styles.toggleThumb,
            {
              transform: [{ translateX: value ? 24 : 0 }],
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

function SettingTimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingInputRow, { marginTop: Spacing.md }]}>
      <ThemedText type="body" style={styles.settingLabel}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.settingTimeInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={value}
        onChangeText={(text) => {
          // Format as HH:MM
          const formatted = text.replace(/[^0-9]/g, "").slice(0, 4);
          if (formatted.length >= 3) {
            onChange(`${formatted.slice(0, 2)}:${formatted.slice(2)}`);
          } else if (formatted.length === 2) {
            onChange(`${formatted}:`);
          } else {
            onChange(formatted);
          }
        }}
        keyboardType="numeric"
        maxLength={5}
        placeholder="HH:MM"
      />
    </View>
  );
}

function SettingNumberPicker({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (val: number) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingInputRow, { marginTop: Spacing.md }]}>
      <View style={styles.settingInputLabel}>
        <ThemedText type="body" style={styles.settingLabel}>
          {label}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          ({unit})
        </ThemedText>
      </View>
      <TextInput
        style={[
          styles.settingNumberInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={String(value)}
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          if (!isNaN(num) && num >= min && num <= max) {
            onChange(num);
          }
        }}
        keyboardType="numeric"
        maxLength={3}
      />
    </View>
  );
}

const AVATAR_OPTIONS = [1, 2, 3];

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<Settings>({
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadSettings = useCallback(async () => {
    const result = await getSettings();
    if (result.ok) {
      setSettings(result.value);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveSettings(settings);
      if (result.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowSuccess(true);
        // Delay navigation to allow animation to be seen
        setTimeout(() => {
          setShowSuccess(false);
          navigation.goBack();
        }, 1500);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", result.error.message);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportData();
      if (result.ok) {
        const fileName = `studybuddy-backup-${new Date().toISOString().split("T")[0]}.json`;
        const blob = new Blob([result.value], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        if (Platform.OS === "web") {
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          await Sharing.shareAsync(url, {
            mimeType: "application/json",
            dialogTitle: "Export StudyBuddy Data",
          });
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", result.error.message);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const jsonString = await response.text();

      const importResult = await importData(jsonString);
      if (importResult.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Data imported successfully. Restarting app...");
        setTimeout(() => loadSettings(), 500);
      } else {
        Alert.alert("Error", importResult.error.message);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to import data");
    }
  };

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <ThemedView style={styles.loadingContainer} />;
  }

   return (
     <ThemedView style={styles.container}>
       <ScrollView
         contentContainerStyle={[
           styles.content,
           {
             paddingTop: headerHeight + Spacing.xl,
             paddingBottom: insets.bottom + Spacing.xl,
           },
         ]}
         showsVerticalScrollIndicator={false}
       >
         {/* Profile Section */}
         <ThemedText type="h4" style={styles.sectionTitle}>
           Profile
         </ThemedText>
         <Card style={styles.card}>
           <View style={styles.profileRow}>
             <View style={styles.avatarPicker}>
               {AVATAR_OPTIONS.map((num) => (
                 <Pressable
                   key={num}
                   onPress={() => updateSetting("avatar", num)}
                   style={({ pressed }) => [
                     styles.avatarOption,
                     {
                       borderColor:
                         settings.avatar === num ? theme.primary : "transparent",
                       borderWidth: settings.avatar === num ? 3 : 0,
                       opacity: pressed ? 0.7 : 1,
                     },
                   ]}
                   accessibilityLabel={`Select avatar ${num}`}
                   accessibilityRole="button"
                   accessibilityState={{ selected: settings.avatar === num }}
                 >
                   <ThemedView
                     style={[
                       styles.avatarImage,
                       { backgroundColor: theme.primary },
                     ]}
                   >
                     <ThemedText type="h1" style={styles.avatarNumber}>
                       {num}
                     </ThemedText>
                   </ThemedView>
                 </Pressable>
               ))}
             </View>
             <View style={styles.nameInputContainer}>
               <ThemedText type="body" style={styles.label}>
                 Display Name
               </ThemedText>
               <TextInput
                 style={[
                   styles.input,
                   {
                     backgroundColor: theme.backgroundDefault,
                     color: theme.text,
                     borderColor: theme.border,
                   },
                 ]}
                 placeholder="Your name"
                 value={settings.displayName}
                 onChangeText={(text) => updateSetting("displayName", text)}
                 placeholderTextColor={theme.textSecondary}
                 autoCapitalize="words"
               />
             </View>
           </View>
         </Card>
 
         {/* Study Goals Section */}
         <ThemedText
           type="h4"
           style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
         >
           Study Goals
         </ThemedText>
         <Card style={styles.card}>
           <View style={styles.settingRow}>
             <View style={styles.settingInfo}>
               <ThemedText type="body" style={styles.settingLabel}>
                 Daily Goal
               </ThemedText>
               <ThemedText type="small" style={styles.settingDescription}>
                 Minutes you want to study each day
               </ThemedText>
             </View>
             <TextInput
               style={[
                 styles.numberInput,
                 {
                   backgroundColor: theme.backgroundDefault,
                   color: theme.text,
                   borderColor: theme.border,
                 },
               ]}
               placeholder="120"
               value={String(settings.dailyGoalMinutes)}
               onChangeText={(text) => {
                 const num = parseInt(text, 10);
                 if (!isNaN(num) && num > 0 && num <= 1440) {
                   updateSetting("dailyGoalMinutes", num);
                 }
               }}
               keyboardType="numeric"
               maxLength={4}
             />
           </View>
         </Card>
 
         {/* Appearance Section */}
         <ThemedText
           type="h4"
           style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
         >
           Appearance
         </ThemedText>
 
         {/* Dark Mode Toggle */}
         <Card style={styles.card}>
           <View style={styles.toggleRow}>
             <View style={styles.settingInfo}>
               <ThemedText type="body" style={styles.settingLabel}>
                 Dark Mode
               </ThemedText>
               <ThemedText type="small" style={styles.settingDescription}>
                 Use dark theme throughout the app
               </ThemedText>
             </View>
             <Pressable
               onPress={() => updateSetting("darkMode", !settings.darkMode)}
               style={({ pressed }) => [
                 styles.toggleTrack,
                 {
                   backgroundColor: settings.darkMode
                     ? theme.primary
                     : theme.border,
                 },
                 pressed && { opacity: 0.7 },
               ]}
               accessibilityLabel="Dark Mode"
               accessibilityRole="switch"
               accessibilityState={{ checked: settings.darkMode }}
               accessibilityHint={
                 settings.darkMode
                   ? "Tap to disable dark mode"
                   : "Tap to enable dark mode"
               }
             >
               <ThemedView
                 style={[
                   styles.toggleThumb,
                   {
                     transform: [{ translateX: settings.darkMode ? 24 : 0 }],
                   },
                 ]}
               />
             </Pressable>
           </View>
         </Card>
 
         {/* Accent Color Picker */}
         <Card style={styles.card}>
           <ThemedText
             type="body"
             style={[styles.settingLabel, { marginBottom: Spacing.md }]}
           >
             Accent Color
           </ThemedText>
           <View style={styles.colorPicker}>
             {ACCENT_COLORS.map((color) => (
               <Pressable
                 key={color.value}
                 onPress={() => updateSetting("accentColor", color.value)}
                 style={({ pressed }) => [
                   styles.colorOption,
                   {
                     backgroundColor: color.value,
                     borderColor:
                       settings.accentColor === color.value
                         ? theme.text
                         : "transparent",
                     borderWidth: settings.accentColor === color.value ? 3 : 0,
                     opacity: pressed ? 0.7 : 1,
                   },
                 ]}
                 accessibilityLabel={`Select ${color.name} accent color`}
                 accessibilityRole="button"
                 accessibilityState={{
                   selected: settings.accentColor === color.value,
                 }}
               />
             ))}
           </View>
         </Card>
 
         {/* Notifications Section */}
         <ThemedText
           type="h4"
           style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
         >
           Notifications
         </ThemedText>
 
         <Card style={styles.card}>
           <SettingToggle
             label="Daily Study Reminder"
             description="Get reminded to study at your preferred time"
             value={settings.dailyReminderEnabled}
             onChange={(val) => updateSetting("dailyReminderEnabled", val)}
           />
           {settings.dailyReminderEnabled && (
             <SettingTimePicker
               label="Reminder Time"
               value={settings.dailyReminderTime}
               onChange={(val) => updateSetting("dailyReminderTime", val)}
             />
           )}
         </Card>
 
         <Card style={styles.card}>
           <SettingToggle
             label="Streak Alerts"
             description="Get notified if you haven't studied by evening"
             value={settings.streakAlertEnabled}
             onChange={(val) => updateSetting("streakAlertEnabled", val)}
           />
         </Card>
 
         <Card style={styles.card}>
           <SettingToggle
             label="Break Reminders"
             description="Get reminded to take breaks during long sessions"
             value={settings.breakReminderEnabled}
             onChange={(val) => updateSetting("breakReminderEnabled", val)}
           />
           {settings.breakReminderEnabled && (
             <SettingNumberPicker
               label="Break Interval"
               value={settings.breakReminderInterval}
               unit="minutes"
               min={15}
               max={180}
               onChange={(val) => updateSetting("breakReminderInterval", val)}
             />
           )}
         </Card>
 
         {/* Data Section */}
         <ThemedText
           type="h4"
           style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
         >
           Data
         </ThemedText>
 
         <Card style={styles.card}>
           <View style={styles.dataButtonRow}>
             <Button
               onPress={handleExport}
               disabled={exporting}
               style={styles.dataButton}
             >
               {exporting ? "Exporting..." : "Export Data"}
             </Button>
             <Button
               onPress={handleImport}
               variant="secondary"
               style={styles.dataButton}
             >
               Import Data
             </Button>
           </View>
           <ThemedText type="small" style={styles.dataDescription}>
             Export your study data as JSON backup or import from a previous
             export.
           </ThemedText>
         </Card>
 
         {/* Danger Zone */}
         <ThemedText
           type="h4"
           style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
         >
           Danger Zone
         </ThemedText>
         <Card style={[styles.card, styles.dangerCard]}>
           <ThemedText type="body" style={styles.dangerTitle}>
             Reset All Data
           </ThemedText>
           <ThemedText type="small" style={styles.dangerDescription}>
             Permanently delete all subjects, sessions, streaks, and settings.
             This cannot be undone.
           </ThemedText>
           <Button
             onPress={() => {
               Alert.alert(
                 "Reset All Data?",
                 "This will permanently delete everything. Are you sure?",
                 [
                   { text: "Cancel", style: "cancel" },
                   {
                     text: "Reset",
                     style: "destructive",
                     onPress: async () => {
                       try {
                         await Promise.all([AsyncStorage.clear()]);
                         Haptics.notificationAsync(
                           Haptics.NotificationFeedbackType.Success,
                         );
                         Alert.alert("Done", "All data has been reset");
                         navigation.goBack();
                       } catch (err) {
                         Alert.alert("Error", "Failed to reset data");
                       }
                     },
                   },
                 ],
               );
             }}
             variant="danger"
             style={styles.dangerButton}
           >
             Reset Everything
           </Button>
         </Card>
 
         {/* Achievements */}
         <ThemedText
           type="h4"
           style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
         >
           Achievements
         </ThemedText>
         <Card style={styles.card}>
           <Pressable
             onPress={() => navigation.navigate("Achievements")}
             style={({ pressed }) => [
               styles.achievementsButton,
               { backgroundColor: theme.primary },
               pressed && { opacity: 0.7 },
             ]}
             accessibilityLabel="View your achievements"
             accessibilityRole="button"
           >
             <View style={styles.achievementsButtonContent}>
               <Feather name="award" size={24} color="#FFFFFF" />
               <ThemedText type="body" style={styles.achievementsButtonText}>
                 View Achievements
               </ThemedText>
             </View>
           </Pressable>
         </Card>
 
         {/* Version Info */}
         <ThemedText type="small" style={styles.versionText}>
           StudyBuddy v1.0.0
         </ThemedText>
       </ScrollView>
       {showSuccess && (
         <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
           <SuccessAnimation size={120} />
         </View>
       )}
</ThemedView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  card: {
    marginBottom: Spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatarPicker: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  nameInputContainer: {
    flex: 1,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    opacity: 0.6,
  },
  numberInput: {
    width: 80,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    textAlign: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorPicker: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  dataButtonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  dataButton: {
    flex: 1,
  },
  dataDescription: {
    opacity: 0.6,
    textAlign: "center",
  },
  dangerCard: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  dangerTitle: {
    color: "#CC0000",
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  dangerDescription: {
    color: "#CC0000",
    marginBottom: Spacing.md,
  },
  dangerButton: {
    backgroundColor: "#CC0000",
  },
  achievementsButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  achievementsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  achievementsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  versionText: {
    textAlign: "center",
    opacity: 0.4,
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  settingToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInputLabel: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
  },
  settingTimeInput: {
    width: 80,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    textAlign: "center",
  },
  settingNumberInput: {
    width: 80,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    textAlign: "center",
  },
});

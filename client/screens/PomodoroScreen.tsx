import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, TimerSizes } from "@/constants/theme";
import {
  formatTime,
  addSession,
  getRandomMotivationalMessage,
  formatDuration,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useWidgetTrigger } from "@/widgets/hooks";

type TimerRouteProp = RouteProp<RootStackParamList, "Timer">;

type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

const DEFAULT_POMODORO: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
};

export default function PomodoroScreen() {
  const navigation = useNavigation();
  const route = useRoute<TimerRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const { subjectId, subjectName } = route.params;

  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO);
  const triggerWidgetSync = useWidgetTrigger();
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  const phaseDurations = {
    work: settings.workMinutes * 60,
    shortBreak: settings.shortBreakMinutes * 60,
    longBreak: settings.longBreakMinutes * 60,
  };

  // Pulse animation for timer when running
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isRunning, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getPhaseColor = () => {
    switch (phase) {
      case "work":
        return theme.primary;
      case "shortBreak":
        return theme.success;
      case "longBreak":
        return theme.warning;
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "work":
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  const getNextPhase = (): PomodoroPhase => {
    if (phase === "work") {
      const nextSession = completedSessions + 1;
      if (nextSession % settings.sessionsUntilLongBreak === 0) {
        return "longBreak";
      }
      return "shortBreak";
    }
    return "work";
  };

  const handlePhaseComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(false);

    if (phase === "work") {
      // Save study session
      const workedSeconds = settings.workMinutes * 60;
      addSession(subjectId, subjectName, workedSeconds);
      setCompletedSessions((prev) => prev + 1);
      setMotivationalMessage(getRandomMotivationalMessage());
      setShowCompletion(true);
      // Sync widget data in background
      triggerWidgetSync();
    }

    // Auto-advance to next phase
    const nextPhase = getNextPhase();
    setPhase(nextPhase);
    setSeconds(phaseDurations[nextPhase]);

    if (settings.autoStartBreaks && phase === "work") {
      setIsRunning(true);
    } else if (settings.autoStartWork && nextPhase === "work") {
      setIsRunning(true);
    }
  };

  // Timer logic using Date.now() for accuracy
  useEffect(() => {
    if (!isRunning) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, phaseDurations[phase] - elapsed);
      if (isMountedRef.current) {
        setSeconds(remaining);
      }
      if (remaining === 0) {
        handlePhaseComplete();
      }
    };

    updateTimer();
    const id = setInterval(updateTimer, 100);
    return () => clearInterval(id);
  }, [isRunning, phase, handlePhaseComplete, phaseDurations]);

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimeRef.current =
      Date.now() - (phaseDurations[phase] - seconds) * 1000;
    setIsRunning(true);
  }, [phase, seconds, phaseDurations]);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
  }, []);

  const handleStop = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(false);
    navigation.goBack();
  }, [navigation]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    const nextPhase = getNextPhase();
    setPhase(nextPhase);
    setSeconds(phaseDurations[nextPhase]);
  }, [completedSessions, getNextPhase, phaseDurations]);

  const handleSettingsSave = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    // Reset timer to new phase duration
    setSeconds(phaseDurations[phase]);
  };

  const phaseColor = getPhaseColor();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable
          onPress={handleStop}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: theme.backgroundDefault },
            pressed && { opacity: 0.7 },
          ]}
          testID="button-close-pomodoro"
          accessibilityLabel="Close Pomodoro"
          accessibilityRole="button"
        >
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => setShowSettings(true)}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && { opacity: 0.7 },
          ]}
          testID="button-pomodoro-settings"
          accessibilityLabel="Pomodoro settings"
          accessibilityRole="button"
        >
          <Feather name="settings" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ThemedText type="h3" style={styles.subjectName}>
          {subjectName}
        </ThemedText>

        <ThemedText
          type="h4"
          style={[
            styles.phaseLabel,
            { color: phaseColor, marginBottom: Spacing.lg },
          ]}
        >
          {getPhaseLabel()}
        </ThemedText>

        <Animated.View
          style={[
            styles.timerContainer,
            { backgroundColor: theme.cardBackground },
            Shadows.card,
            animatedStyle,
          ]}
        >
          <ThemedText type="h1" style={styles.timer}>
            {formatTime(seconds)}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.timerLabel, { color: theme.textSecondary }]}
          >
            {isRunning
              ? `${getPhaseLabel()} in progress...`
              : `Ready to ${phase === "work" ? "focus" : "rest"}`}
          </ThemedText>
        </Animated.View>

        <View style={styles.sessionCounter}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Completed: {completedSessions} session
            {completedSessions !== 1 ? "s" : ""}
          </ThemedText>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.mainButton,
                { backgroundColor: phaseColor },
                pressed && { opacity: 0.7 },
              ]}
              testID="button-start-pomodoro"
              accessibilityLabel={`${phase === "work" ? "Start focus" : "Start break"}`}
              accessibilityRole="button"
            >
              <Feather name="play" size={32} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePause}
              style={({ pressed }) => [
                styles.mainButton,
                { backgroundColor: theme.warning },
                pressed && { opacity: 0.7 },
              ]}
              testID="button-pause-pomodoro"
              accessibilityLabel="Pause"
              accessibilityRole="button"
            >
              <Feather name="pause" size={32} color="#FFFFFF" />
            </Pressable>
          )}

          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              { backgroundColor: theme.backgroundDefault },
              pressed && { opacity: 0.7 },
            ]}
            testID="button-skip-phase"
            accessibilityLabel="Skip to next phase"
            accessibilityRole="button"
          >
            <Feather name="skip-forward" size={24} color={theme.text} />
            <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
          </Pressable>

          <Pressable
            onPress={handleStop}
            style={({ pressed }) => [
              styles.stopButton,
              { backgroundColor: theme.backgroundDefault },
              pressed && { opacity: 0.7 },
            ]}
            testID="button-stop-pomodoro"
            accessibilityLabel="Stop Pomodoro"
            accessibilityRole="button"
          >
            <Feather name="square" size={24} color={theme.text} />
            <ThemedText style={styles.stopButtonText}>Stop</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <PomodoroSettingsModal
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      </Modal>

      {/* Completion Modal */}
      <Modal
        visible={showCompletion}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletion(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundRoot },
              Shadows.card,
            ]}
          >
            <Image
              source={require("../../assets/images/celebration.png")}
              style={styles.celebrationImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.completionTitle}>
              Great Focus!
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.completionTime, { color: theme.primary }]}
            >
              You focused for {settings.workMinutes} minute
              {settings.workMinutes !== 1 ? "s" : ""}
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.motivationalText, { color: theme.textSecondary }]}
            >
              {motivationalMessage}
            </ThemedText>
            <Button
              onPress={() => setShowCompletion(false)}
              style={styles.doneButton}
            >
              Continue
            </Button>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

function PomodoroSettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
  onClose: () => void;
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const { theme } = useTheme();

  const updateSetting = <K extends keyof PomodoroSettings>(
    key: K,
    value: PomodoroSettings[K],
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.settingsModalOverlay}>
      <View
        style={[
          styles.settingsModalContent,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <View style={styles.settingsModalHeader}>
          <ThemedText type="h3" style={styles.settingsModalTitle}>
            Pomodoro Settings
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.settingsCloseButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            accessibilityLabel="Close settings"
            accessibilityRole="button"
          >
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.settingsScrollView}>
          <View style={styles.settingsSection}>
            <ThemedText type="h4" style={styles.settingsSectionTitle}>
              Durations
            </ThemedText>
            <SettingInput
              label="Work Session"
              value={localSettings.workMinutes}
              unit="min"
              onChange={(val) =>
                updateSetting("workMinutes", Math.max(1, Math.min(120, val)))
              }
            />
            <SettingInput
              label="Short Break"
              value={localSettings.shortBreakMinutes}
              unit="min"
              onChange={(val) =>
                updateSetting(
                  "shortBreakMinutes",
                  Math.max(1, Math.min(60, val)),
                )
              }
            />
            <SettingInput
              label="Long Break"
              value={localSettings.longBreakMinutes}
              unit="min"
              onChange={(val) =>
                updateSetting(
                  "longBreakMinutes",
                  Math.max(1, Math.min(60, val)),
                )
              }
            />
            <SettingInput
              label="Sessions until Long Break"
              value={localSettings.sessionsUntilLongBreak}
              unit="sessions"
              onChange={(val) =>
                updateSetting(
                  "sessionsUntilLongBreak",
                  Math.max(1, Math.min(10, val)),
                )
              }
            />
          </View>

          <View style={styles.settingsSection}>
            <ThemedText type="h4" style={styles.settingsSectionTitle}>
              Auto-Start
            </ThemedText>
            <SettingToggle
              label="Auto-start breaks"
              description="Automatically start break timer after work session"
              value={localSettings.autoStartBreaks}
              onChange={(val) => updateSetting("autoStartBreaks", val)}
            />
            <SettingToggle
              label="Auto-start work"
              description="Automatically start work session after break"
              value={localSettings.autoStartWork}
              onChange={(val) => updateSetting("autoStartWork", val)}
            />
          </View>
        </ScrollView>

        <View style={styles.settingsModalFooter}>
          <Button
            onPress={onClose}
            variant="secondary"
            style={styles.settingsCancelButton}
          >
            Cancel
          </Button>
          <Button
            onPress={() => onSave(localSettings)}
            style={styles.settingsSaveButton}
          >
            Save
          </Button>
        </View>
      </View>
    </View>
  );
}

function SettingInput({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (val: number) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.settingInputRow}>
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
          if (!isNaN(num)) onChange(num);
        }}
        keyboardType="numeric"
        maxLength={3}
      />
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  subjectName: {
    marginBottom: Spacing.lg,
    textAlign: "center",
    fontWeight: "600",
  },
  phaseLabel: {
    fontWeight: "600",
  },
  timerContainer: {
    width: TimerSizes.container,
    height: TimerSizes.container,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timer: {
    fontSize: TimerSizes.fontSize,
    fontWeight: "700",
    letterSpacing: 2,
  },
  timerLabel: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  sessionCounter: {
    marginBottom: Spacing["3xl"],
  },
  controls: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  skipButtonText: {
    fontWeight: "600",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  stopButtonText: {
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  celebrationImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  completionTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  completionTime: {
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  motivationalText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  doneButton: {
    width: "100%",
  },

  // Settings Modal Styles
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  settingsModalContent: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "90%",
  },
  settingsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  settingsModalTitle: {
    fontWeight: "600",
  },
  settingsCloseButton: {
    padding: Spacing.xs,
  },
  settingsScrollView: {
    flex: 1,
    padding: Spacing.lg,
  },
  settingsSection: {
    marginBottom: Spacing.xl,
  },
  settingsSectionTitle: {
    marginBottom: Spacing.lg,
  },
  settingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  settingInputLabel: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
  },
  settingLabel: {
    fontWeight: "500",
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
  settingToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    opacity: 0.6,
    marginTop: Spacing.xs,
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
  settingsModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  settingsCancelButton: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingsSaveButton: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "@/components/ProgressBar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Subject, formatMinutes } from "@/lib/storage";
import { useReducedMotionPreference } from "@/lib/animations";

interface SubjectCardProps {
  subject: Subject;
  dailyGoal: number;
  onStartStudy: () => void;
  onStartPomodoro?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SubjectCard({
  subject,
  dailyGoal,
  onStartStudy,
  onStartPomodoro,
}: SubjectCardProps) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);

  const progress = dailyGoal > 0 ? subject.totalMinutes / dailyGoal : 0;

  const handlePressIn = () => {
    if (reducedMotion) return;
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleStartPomodoro = () => {
    if (onStartPomodoro) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onStartPomodoro();
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.card,
        cardAnimatedStyle,
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h4" style={styles.name}>
          {subject.name}
        </ThemedText>
        <View style={styles.timeContainer}>
          <Feather name="clock" size={14} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={[styles.time, { color: theme.textSecondary }]}
          >
            {formatMinutes(subject.totalMinutes)} total
          </ThemedText>
        </View>
      </View>

      <ProgressBar progress={progress} style={styles.progressBar} />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={onStartStudy}
          style={({ pressed }) => [
            styles.startButton,
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.7 },
          ]}
          testID={`button-start-study-${subject.id}`}
          accessibilityLabel="Start study session for {subject.name}"
          accessibilityRole="button"
          accessibilityHint="Begins a timed study session"
        >
          <Feather name="play" size={18} color="#FFFFFF" />
          <ThemedText style={styles.startButtonText}>Start Study</ThemedText>
        </Pressable>

        {onStartPomodoro ? (
          <Pressable
            onPress={handleStartPomodoro}
            style={({ pressed }) => [
              styles.pomodoroButton,
              { backgroundColor: theme.warning },
              pressed && { opacity: 0.7 },
            ]}
            testID={`button-start-pomodoro-${subject.id}`}
            accessibilityLabel="Start Pomodoro session for {subject.name}"
            accessibilityRole="button"
            accessibilityHint="Begins a Pomodoro focus session with breaks"
          >
            <Feather name="clock" size={18} color="#FFFFFF" />
            <ThemedText style={styles.pomodoroButtonText}>Pomodoro</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  time: {
    marginLeft: Spacing.xs,
  },
  progressBar: {
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  startButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  pomodoroButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  pomodoroButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

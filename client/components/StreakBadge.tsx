import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  useAnimatedStyle,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useReducedMotionPreference } from "@/lib/animations";

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withSequence(
      withSpring(1.2, { damping: 15, stiffness: 150 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  }, [streak, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground },
        Shadows.small,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.warning }]}>
        <Feather name="zap" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Animated.View style={animatedStyle}>
          <ThemedText type="h4" style={styles.streakNumber}>
            {streak} Day{streak !== 1 ? "s" : ""}
          </ThemedText>
        </Animated.View>
        <ThemedText
          type="small"
          style={[styles.label, { color: theme.textSecondary }]}
        >
          Current Streak
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: Spacing.lg,
  },
  streakNumber: {
    fontWeight: "700",
  },
  label: {},
});

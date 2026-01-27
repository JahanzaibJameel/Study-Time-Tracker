import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { theme } = useTheme();

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
        <ThemedText type="h4" style={styles.streakNumber}>
          {streak} Day{streak !== 1 ? "s" : ""}
        </ThemedText>
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

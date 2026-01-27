import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon, value, label, color }: StatCardProps) {
  const { theme } = useTheme();
  const iconColor = color || theme.primary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground },
        Shadows.small,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <ThemedText type="h3" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.label, { color: theme.textSecondary }]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  value: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  label: {
    textAlign: "center",
  },
});

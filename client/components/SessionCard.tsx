import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { StudySession, formatMinutes } from "@/lib/storage";

interface SessionCardProps {
  session: StudySession;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function SessionCard({ session }: SessionCardProps) {
  const { theme } = useTheme();
  const minutes = Math.floor(session.duration / 60);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.small,
      ]}
    >
      <View style={styles.left}>
        <View
          style={[styles.iconContainer, { backgroundColor: theme.primary }]}
        >
          <Feather name="book-open" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="body" style={styles.subjectName}>
            {session.subjectName}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.timeAgo, { color: theme.textSecondary }]}
          >
            {getTimeAgo(session.date)}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="body" style={[styles.duration, { color: theme.primary }]}>
        {formatMinutes(minutes)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  subjectName: {
    fontWeight: "500",
  },
  timeAgo: {},
  duration: {
    fontWeight: "600",
  },
});

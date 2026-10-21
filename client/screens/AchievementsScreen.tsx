import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { AchievementBadge } from "@/components/AchievementBadge";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Achievement, ACHIEVEMENTS, useAchievements } from "@/lib/achievements";
import { Feather } from "@expo/vector-icons";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const {
    unlockedAchievements,
    newlyUnlocked,
    isLoading,
    checkAchievements,
    clearNewlyUnlocked,
  } = useAchievements();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const loadAchievements = useCallback(async () => {
    await checkAchievements();
  }, [checkAchievements]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const getFilteredAchievements = () => {
    switch (filter) {
      case "unlocked":
        return ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id));
      case "locked":
        return ACHIEVEMENTS.filter((a) => !unlockedAchievements.includes(a.id));
      default:
        return ACHIEVEMENTS;
    }
  };

  const achievements = getFilteredAchievements();

  const groupedAchievements = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, typeof ACHIEVEMENTS>,
  );

  const categoryOrder = ["streak", "time", "sessions", "subjects", "special"];
  const categoryLabels: Record<string, string> = {
    streak: "Streak",
    time: "Study Time",
    sessions: "Sessions",
    subjects: "Subjects",
    special: "Special",
  };

  if (isLoading) {
    return <ThemedView style={styles.loadingContainer} />;
  }

  const renderAchievementsGrid = () => {
    if (achievements.length === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-stats.png")}
          title="No Achievements Found"
          subtitle={`No ${filter} achievements to show`}
        />
      );
    }

    return (
      <>
        {categoryOrder.map((category) => {
          const categoryAchievements = groupedAchievements[category];
          if (!categoryAchievements || categoryAchievements.length === 0)
            return null;

          return (
            <View key={category} style={styles.categorySection}>
              <ThemedText type="h4" style={styles.categoryTitle}>
                {categoryLabels[category]}
              </ThemedText>
              <View style={styles.grid}>
                {categoryAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedAchievements.includes(achievement.id)}
                    size="medium"
                  />
                ))}
              </View>
            </View>
          );
        })}
      </>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText
                type="h3"
                style={[styles.statNumber, { color: theme.primary }]}
              >
                {unlockedAchievements.length}
              </ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                Unlocked
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText
                type="h3"
                style={[styles.statNumber, { color: theme.warning }]}
              >
                {ACHIEVEMENTS.length - unlockedAchievements.length}
              </ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                Remaining
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText
                type="h3"
                style={[styles.statNumber, { color: theme.success }]}
              >
                {Math.round(
                  (unlockedAchievements.length / ACHIEVEMENTS.length) * 100,
                )}
                %
              </ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                Complete
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={({ pressed }) => [
                styles.filterTab,
                {
                  backgroundColor:
                    filter === f ? theme.primary : theme.backgroundDefault,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.filterTabText,
                  { color: filter === f ? "#FFFFFF" : theme.text },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Achievements Grid */}
        {renderAchievementsGrid()}
      </ScrollView>
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
  statsCard: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontWeight: "700",
  },
  statLabel: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
  },
  filterTabs: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  filterTabText: {
    fontWeight: "600",
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
});

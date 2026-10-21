import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { WeeklyChart } from "@/components/WeeklyChart";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Shadows, BorderRadius } from "@/constants/theme";
import {
  getWeeklyStats,
  getAllTimeStats,
  getSubjects,
  Subject,
  formatMinutes,
} from "@/lib/storage";

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [weeklyData, setWeeklyData] = useState<
    { day: string; minutes: number }[]
  >([]);
  const [allTimeStats, setAllTimeStats] = useState({
    totalHours: 0,
    totalSessions: 0,
    currentStreak: 0,
  });
  const [topSubjects, setTopSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [weeklyResult, statsResult, subjectsResult] = await Promise.all([
      getWeeklyStats(),
      getAllTimeStats(),
      getSubjects(),
    ]);

    if (weeklyResult.ok) {
      setWeeklyData(weeklyResult.value);
    } else {
      if (__DEV__)
        console.error("Error loading weekly stats:", weeklyResult.error);
    }

    if (statsResult.ok) {
      setAllTimeStats(statsResult.value);
    } else {
      if (__DEV__)
        console.error("Error loading all-time stats:", statsResult.error);
    }

    if (subjectsResult.ok) {
      const sorted = [...subjectsResult.value].sort(
        (a, b) => b.totalMinutes - a.totalMinutes,
      );
      setTopSubjects(sorted.slice(0, 5));
    } else {
      if (__DEV__)
        console.error("Error loading subjects:", subjectsResult.error);
    }

    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const hasData = allTimeStats.totalSessions > 0;

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      />
    );
  }

  if (!hasData) {
    return (
      <View
        style={[
          styles.container,
          styles.emptyContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <EmptyState
          image={require("../../assets/images/empty-stats.png")}
          title="No Stats Yet"
          subtitle="Complete your first study session to see your statistics"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <WeeklyChart data={weeklyData} />

      <ThemedText type="h4" style={styles.sectionTitle}>
        All Time
      </ThemedText>
      <View style={styles.statsRow}>
        <StatCard
          icon="clock"
          value={`${allTimeStats.totalHours}h`}
          label="Total Hours"
        />
        <View style={styles.statSpacer} />
        <StatCard
          icon="check-circle"
          value={allTimeStats.totalSessions}
          label="Sessions"
          color={theme.success}
        />
        <View style={styles.statSpacer} />
        <StatCard
          icon="zap"
          value={allTimeStats.currentStreak}
          label="Day Streak"
          color={theme.warning}
        />
      </View>

      {topSubjects.length > 0 ? (
        <>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Top Subjects
          </ThemedText>
          <View
            style={[
              styles.topSubjectsCard,
              { backgroundColor: theme.cardBackground },
              Shadows.small,
            ]}
          >
            {topSubjects.map((subject, index) => (
              <View
                key={subject.id}
                style={[
                  styles.subjectRow,
                  index < topSubjects.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <View style={styles.subjectRank}>
                  <ThemedText
                    type="body"
                    style={[styles.rankNumber, { color: theme.textSecondary }]}
                  >
                    #{index + 1}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.subjectName}>
                  {subject.name}
                </ThemedText>
                <ThemedText
                  type="body"
                  style={[styles.subjectTime, { color: theme.primary }]}
                >
                  {formatMinutes(subject.totalMinutes)}
                </ThemedText>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
  },
  statSpacer: {
    width: Spacing.md,
  },
  topSubjectsCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  subjectRank: {
    width: 36,
  },
  rankNumber: {
    fontWeight: "600",
  },
  subjectName: {
    flex: 1,
    fontWeight: "500",
  },
  subjectTime: {
    fontWeight: "600",
  },
});

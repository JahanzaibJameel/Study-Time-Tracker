import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { CircularProgress } from "@/components/CircularProgress";
import { StreakBadge } from "@/components/StreakBadge";
import { SessionCard } from "@/components/SessionCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getHomeData, StudySession, StreakData } from "@/lib/storage";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [todayMinutes, setTodayMinutes] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(120);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastStudyDate: null,
  });
  const [todaySessions, setTodaySessions] = useState<
    (StudySession & { subjectName: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const result = await getHomeData();
    if (result.ok) {
      setTodayMinutes(result.value.todayMinutes);
      setStreak(result.value.streak);
      setTodaySessions(result.value.todaySessions);
      setDailyGoal(result.value.settings.dailyGoalMinutes);
    } else {
      if (__DEV__) console.error("Error loading home data:", result.error);
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

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.progressContainer}>
        <CircularProgress current={todayMinutes} goal={dailyGoal} size={200} />
      </View>

      <StreakBadge streak={streak.currentStreak} />

      {todaySessions.length > 0 ? (
        <ThemedText type="h4" style={styles.sectionTitle}>
          Today&apos;s Sessions
        </ThemedText>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-today.png")}
      title="Start Your First Session"
      subtitle="Head to Subjects to begin studying!"
    />
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
      >
        {/* Header skeleton */}
        <View style={{ marginBottom: Spacing.lg }}>
          <View
            style={{
              alignItems: "center",
              marginBottom: Spacing["2xl"],
            }}
          >
            <Skeleton
              width={200}
              height={200}
              borderRadius={100}
              style={{ marginBottom: Spacing.md }}
            />
            <Skeleton
              width={60}
              height={24}
              style={{ marginBottom: Spacing.lg }}
            />
          </View>
        </View>

        {/* Section title skeleton */}
        <Skeleton
          width={120}
          height={20}
          style={{
            marginTop: Spacing.xl,
            marginBottom: Spacing.md,
          }}
        />

        {/* Session cards skeleton - show 3 placeholders */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Skeleton
            height={80}
            width="100%"
            style={{ marginBottom: Spacing.md }}
          />
          <Skeleton
            height={80}
            width="100%"
            style={{ marginBottom: Spacing.md }}
          />
          <Skeleton
            height={80}
            width="100%"
            style={{ marginBottom: Spacing.md }}
          />
        </View>
      </View>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={todaySessions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SessionCard session={item} />}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  headerContent: {
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
});

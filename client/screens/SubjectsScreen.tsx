import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { SubjectCard } from "@/components/SubjectCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getSubjects, getSettings, Subject } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function SubjectsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dailyGoal, setDailyGoal] = useState(120);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [subjectsResult, settingsResult] = await Promise.all([
      getSubjects(),
      getSettings(),
    ]);

    if (subjectsResult.ok) {
      setSubjects(subjectsResult.value);
    } else {
      if (__DEV__)
        console.error("Error loading subjects:", subjectsResult.error);
    }

    if (settingsResult.ok) {
      setDailyGoal(settingsResult.value.dailyGoalMinutes);
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

  const handleStartStudy = (subject: Subject) => {
    navigation.navigate("Timer", {
      subjectId: subject.id,
      subjectName: subject.name,
    });
  };

  const handleStartPomodoro = (subject: Subject) => {
    navigation.navigate("Pomodoro", {
      subjectId: subject.id,
      subjectName: subject.name,
    });
  };

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-subjects.png")}
      title="No Subjects Yet"
      subtitle="Tap the + button to add your first subject"
    />
  );

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

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        subjects.length === 0 && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={subjects}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SubjectCard
          subject={item}
          dailyGoal={dailyGoal}
          onStartStudy={() => handleStartStudy(item)}
          onStartPomodoro={() => handleStartPomodoro(item)}
        />
      )}
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
  loadingContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flex: 1,
  },
});

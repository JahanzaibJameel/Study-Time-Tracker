import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AnimationConfig } from "@/lib/animations";
import { useReducedMotionPreference } from "@/lib/animations";

interface DayData {
  day: string;
  minutes: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const { theme } = useTheme();
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const maxHeight = 120;
  const reducedMotion = useReducedMotionPreference();

  // Initialize shared values for bar heights (start at 0)
  const barHeights = data.map(() => useSharedValue(0));

  // Calculate target heights for each bar
  const targetHeights = data.map((item) =>
    item.minutes > 0 ? (item.minutes / maxMinutes) * maxHeight : 4
  );

  // Function to animate bar heights with stagger
  const animateBars = () => {
    barHeights.forEach((height, index) => {
      if (reducedMotion) {
        height.value = targetHeights[index];
        return;
      }
      height.value = withDelay(
        index * AnimationConfig.delay.stagger,
        withSpring(targetHeights[index], AnimationConfig.spring.card)
      );
    });
  };

  // Animate bars when data changes or on mount
  useEffect(() => {
    animateBars();
  }, [animateBars, data.length, reducedMotion]);

  return (
    <View style={styles.container}>
      <ThemedText type="h4" style={styles.title}>
        This Week
      </ThemedText>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const isToday = index === data.length - 1;
          return (
            <View key={item.day} style={styles.barContainer}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    height: barHeights[index].value,
                    backgroundColor: isToday
                      ? theme.primary
                      : theme.progressBackground,
                  },
                ]}
              />
              <ThemedText
                type="small"
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? theme.text : theme.textSecondary,
                    fontWeight: isToday ? "600" : "400",
                  },
                ]}
              >
                {item.day}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    paddingTop: Spacing.lg,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 24,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
  },
});
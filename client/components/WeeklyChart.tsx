import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

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

  return (
    <View style={styles.container}>
      <ThemedText type="h4" style={styles.title}>
        This Week
      </ThemedText>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight =
            item.minutes > 0 ? (item.minutes / maxMinutes) * maxHeight : 4;
          const isToday = index === data.length - 1;

          return (
            <View key={item.day} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
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

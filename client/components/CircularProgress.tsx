import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  useEffect as useAnimatedEffect,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { formatMinutes } from "@/lib/storage";

interface CircularProgressProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({
  current,
  goal,
  size = 200,
  strokeWidth = 12,
}: CircularProgressProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  React.useEffect(() => {
    const targetProgress = goal > 0 ? Math.min(current / goal, 1) : 0;
    progress.value = withSpring(targetProgress, {
      damping: 15,
      stiffness: 80,
    });
  }, [current, goal]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.progressBackground}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <ThemedText type="h2" style={styles.currentText}>
          {formatMinutes(current)}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.goalText, { color: theme.textSecondary }]}
        >
          / {formatMinutes(goal)} goal
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.percentageText, { color: theme.primary }]}
        >
          {percentage}%
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
  },
  currentText: {
    fontWeight: "700",
  },
  goalText: {
    marginTop: 2,
  },
  percentageText: {
    marginTop: 8,
    fontWeight: "600",
  },
});

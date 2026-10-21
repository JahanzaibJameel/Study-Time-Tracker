import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, ThemeColors } from "@/constants/theme";
import { useReducedMotionPreference } from "@/lib/animations";

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, height = 8, style }: ProgressBarProps) {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    if (reducedMotion) {
      animatedProgress.value = clampedProgress;
    } else {
      animatedProgress.value = withSpring(clampedProgress, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [progress, animatedProgress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: theme.progressBackground },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: theme.progressFill },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.md,
  },
});

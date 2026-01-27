import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius } from "@/constants/theme";

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, height = 8, style }: ProgressBarProps) {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(Math.min(Math.max(progress, 0), 1), {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

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
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
});

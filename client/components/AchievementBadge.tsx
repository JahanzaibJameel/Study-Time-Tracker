import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Achievement, RARITY_COLORS } from "@/lib/achievements";
import { useReducedMotionPreference } from "@/lib/animations";
import { useLayoutAnimation } from "@/lib/animations";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: "small" | "medium" | "large";
  onPress?: () => void;
}

const SIZE_CONFIG = {
  small: { iconSize: 20, badgeSize: 48, fontSize: 10 },
  medium: { iconSize: 28, badgeSize: 64, fontSize: 12 },
  large: { iconSize: 40, badgeSize: 88, fontSize: 14 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AchievementBadge({
  achievement,
  unlocked,
  size = "medium",
  onPress,
}: AchievementBadgeProps) {
  const { theme } = useTheme();
  const config = SIZE_CONFIG[size];
  const rarityColor = RARITY_COLORS[achievement.rarity];
  const reducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);
  const { mount, animatedStyle: layoutAnimatedStyle } = useLayoutAnimation();

  useEffect(() => {
    mount();
  }, [mount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: unlocked ? 1 : 0.4,
  }));

  const handlePressIn = () => {
    if (!onPress || reducedMotion) return;
    scale.value = withSpring(0.92, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    if (!onPress || reducedMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.badge,
        { width: config.badgeSize, height: config.badgeSize },
        animatedStyle,
        layoutAnimatedStyle,
      ]}
      accessibilityLabel={
        unlocked
          ? `${achievement.name}, unlocked`
          : `${achievement.name}, locked`
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: !unlocked }}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: config.badgeSize - 8,
            height: config.badgeSize - 8,
            backgroundColor: unlocked ? rarityColor : theme.border,
          },
        ]}
      >
        <Feather
          name={achievement.icon as any}
          size={config.iconSize}
          color={unlocked ? "#FFFFFF" : theme.textSecondary}
        />
      </View>
      {unlocked && (
        <View style={styles.rarityIndicator}>
          <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
        </View>
      )}
      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Feather
            name="lock"
            size={config.iconSize * 0.6}
            color={theme.textSecondary}
          />
        </View>
      )}
      <ThemedText
        type="small"
        style={[
          styles.name,
          {
            fontSize: config.fontSize,
            color: unlocked ? theme.text : theme.textSecondary,
          },
        ]}
        numberOfLines={2}
      >
        {achievement.name}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rarityIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    flexDirection: "row",
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 6,
    textAlign: "center",
    width: "100%",
  },
});

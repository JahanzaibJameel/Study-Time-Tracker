import React, { useEffect } from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import Animated from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { useLayoutAnimation } from "@/lib/animations";
import { useFloatingAnimation } from "@/lib/animations";

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface EmptyStateProps {
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}

export function EmptyState({ image, title, subtitle }: EmptyStateProps) {
  const { theme } = useTheme();
  const { mount, animatedStyle: layoutAnimatedStyle } = useLayoutAnimation();
  const { start: startFloating, animatedStyle: floatingAnimatedStyle } = useFloatingAnimation(
    8, // amplitude
    3000 // duration
  );

  useEffect(() => {
    mount();
    startFloating();
  }, [mount, startFloating]);

  return (
    <Animated.View style={[styles.container, layoutAnimatedStyle]}>
      <Animated.View style={[styles.imageContainer, floatingAnimatedStyle]}>
        <AnimatedImage source={image} style={styles.image} resizeMode="contain" />
      </Animated.View>
      <ThemedText type="h4" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {subtitle}
        </ThemedText>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  imageContainer: {
    width: 180,
    height: 180,
    marginBottom: Spacing.xl,
  },
  image: {
    width: 180,
    height: 180,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
});

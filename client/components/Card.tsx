import React from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, View } from "react-native";
import Animated from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useLayoutAnimation } from "@/lib/animations";

interface CardProps {
  variant?: "card" | "small" | "elevated" | "outlined" | "ghost";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const springConfig = {
  gentle: { damping: 18, stiffness: 160, mass: 1 },
  snappy: { damping: 22, stiffness: 180, mass: 0.9 },
  card: { damping: 16, stiffness: 140, mass: 1.1 },
};

const variantStyles: any = {
  card: {
    shadow: "card",
    borderWidth: 0,
    padding: "xl",
  },
  small: {
    shadow: "small",
    borderWidth: 0,
    padding: "lg",
  },
  elevated: {
    shadow: "medium",
    borderWidth: 0,
    padding: "xl",
  },
  outlined: {
    shadow: "none",
    borderWidth: 1,
    padding: "xl",
  },
  ghost: {
    shadow: "none",
    borderWidth: 0,
    padding: "xl",
  },
};

export function Card({
  variant = "card",
  title,
  description,
  children,
  onPress,
  style,
  testID,
  accessibilityLabel,
}: CardProps) {
  const { theme } = useTheme();
  
  const { mount, animatedStyle: layoutStyle } = useLayoutAnimation();
  
  // Mount animation
  React.useEffect(() => {
    mount();
  }, [mount]);

  const vStyles = variantStyles[variant];
  const shadowStyle = vStyles.shadow !== "none" ? (Shadows as any)[vStyles.shadow] : {};

  const handlePressIn = () => {
    if (!onPress) return;
  };

  const handlePressOut = () => {};

  const handleHoverIn = () => {
    if (onPress) return;
  };

  const handleHoverOut = () => {};

  const handlePress = () => {
    if (onPress) onPress();
  };

  const getBorderStyle = () => {
    if (vStyles.borderWidth > 0) {
      return { borderWidth: vStyles.borderWidth, borderColor: theme.border };
    }
    return {};
  };

  const getPadding = () => {
    switch (vStyles.padding) {
      case "xl": return Spacing.xl;
      case "lg": return Spacing.lg;
      case "md": return Spacing.md;
      default: return Spacing.xl;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      disabled={!onPress}
      accessibilityState={{ disabled: !onPress }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? "button" : undefined}
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: variant === "ghost" ? "transparent" : theme.cardBackground,
          ...(shadowStyle as any),
          ...getBorderStyle(),
          padding: getPadding(),
        } as any,
        style,
      ]}
      hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
    >
      <View style={styles.content}>
        {title ? (
          <ThemedText type="h4" style={styles.cardTitle}>
            {title}
          </ThemedText>
        ) : null}
        {description ? (
          <ThemedText type="small" style={styles.cardDescription}>
            {description}
          </ThemedText>
        ) : null}
        {children}
      </View>
    </Pressable>
  );
}

function usePressAnimation() {
  const isPressed = { value: false };
  return { isPressed, pressIn: () => {}, pressOut: () => {} };
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  content: {
    width: "100%",
  },
  cardTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  cardDescription: {
    opacity: 0.7,
  },
});
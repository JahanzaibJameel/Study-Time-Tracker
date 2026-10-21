import React, { ReactNode, useEffect } from "react";
import {
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  Platform,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
  runOnJS,
  withRepeat,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { useScaleAnimation, useReducedMotionPreference } from "@/lib/animations";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  hapticFeedback?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const sizeConfig = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 13, iconSize: 16, gap: 6 },
  md: { height: 44, paddingHorizontal: 16, fontSize: 15, iconSize: 18, gap: 8 },
  lg: { height: 52, paddingHorizontal: 24, fontSize: 16, iconSize: 20, gap: 10 },
  xl: { height: 60, paddingHorizontal: 32, fontSize: 18, iconSize: 24, gap: 12 },
};

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "lg",
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  hapticFeedback = true,
}: ButtonProps) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const ripple = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);

  const { height, paddingHorizontal, fontSize, iconSize, gap } = sizeConfig[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      // Haptic feedback would be triggered here
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!reducedMotion) {
      scale.value = withSpring(0.96, { ...springConfig, stiffness: 180 } as WithSpringConfig);
      opacity.value = withTiming(0.8, { duration: 100 });

      // Ripple effect
      ripple.value = 0;
      rippleOpacity.value = withTiming(0.3, { duration: 50 });
      rippleScale.value = withTiming(1, { duration: 300 });
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    if (!reducedMotion) {
      scale.value = withSpring(1, { ...springConfig, stiffness: 200 } as WithSpringConfig);
      opacity.value = withTiming(1, { duration: 150 });

      // Fade out ripple
      rippleOpacity.value = withTiming(0, { duration: 200 });
    }
  };

  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: theme.primary,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.border,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
        };
      case "danger":
        return {
          backgroundColor: theme.warning,
        };
      default:
        return {
          backgroundColor: theme.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return theme.primary;
      case "outline":
        return theme.text;
      case "ghost":
        return theme.text;
      case "danger":
        return theme.buttonText;
      default:
        return theme.buttonText;
    }
  };

  const getShadowStyle = () => {
    if (variant === "primary" || variant === "danger") {
      return Shadows.button;
    }
    return {};
  };

  const content = (
    <>
      {/* Ripple effect overlay */}
      <Animated.View
        style={[
          styles.ripple,
          { backgroundColor: getTextColor() },
          rippleStyle,
        ]}
        pointerEvents="none"
      />
      
      {/* Button content */}
      <View style={styles.content}>
        {loading ? (
          <LoadingSpinner size={size} color={getTextColor()} />
        ) : (
          <>
            {leftIcon && (
              <View style={[styles.iconWrapper, { marginRight: gap }]}>
                {leftIcon}
              </View>
            )}
            <ThemedText
              type="body"
              style={[
                styles.buttonText,
                { color: getTextColor(), fontSize },
              ]}
            >
              {children}
            </ThemedText>
            {rightIcon && (
              <View style={[styles.iconWrapper, { marginLeft: gap }]}>
                {rightIcon}
              </View>
            )}
          </>
        )}
      </View>
    </>
  );

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityLabel={loading ? "Loading" : undefined}
      style={[
        styles.button,
        getButtonStyle(),
        getShadowStyle(),
        { height },
        fullWidth && { width: "100%" },
        { paddingHorizontal },
        disabled && { opacity: 0.5 },
        disabled && Platform.OS === "web" ? ({ pointerEvents: "none" } as any) : {},
        style,
        animatedStyle,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
    >
      {content}
    </Pressable>
  );
}

function LoadingSpinner({ size, color }: { size: keyof typeof sizeConfig; color: string }) {
  const rotation = useSharedValue(0);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) return;
    
    rotation.value = withRepeat(
      withTiming(360, { duration: 800 }),
      -1
    );
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spinnerSize = sizeConfig[size].iconSize * 1.5;
  const strokeWidth = Math.max(2, spinnerSize / 12);

  return (
    <Animated.View style={[styles.spinner, { width: spinnerSize, height: spinnerSize }, spinnerStyle]}>
      <Svg width={spinnerSize} height={spinnerSize}>
        <Circle
          cx={spinnerSize / 2}
          cy={spinnerSize / 2}
          r={spinnerSize / 2 - strokeWidth}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={24 * (spinnerSize / 24)}
          strokeDashoffset={6 * (spinnerSize / 24)}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

import Svg, { Circle } from "react-native-svg";

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  buttonText: {
    fontWeight: "600",
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
  },
  spinner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
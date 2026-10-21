import { useSharedValue, withSpring, withTiming, withDelay, useAnimatedStyle, runOnJS, withRepeat, withSequence, Easing, cancelAnimation } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Animation configuration constants
 */
export const AnimationConfig = {
  // Spring configurations
  spring: {
    gentle: { damping: 20, stiffness: 150, mass: 1 },
    bouncy: { damping: 15, stiffness: 180, mass: 1 },
    snappy: { damping: 25, stiffness: 200, mass: 0.8 },
    card: { damping: 18, stiffness: 160, mass: 1 },
    modal: { damping: 20, stiffness: 140, mass: 1.2 },
  },

  // Timing configurations
  timing: {
    fast: { duration: 150, easing: Easing.out(Easing.quad) },
    normal: { duration: 250, easing: Easing.out(Easing.cubic) },
    slow: { duration: 400, easing: Easing.out(Easing.quart) },
    modal: { duration: 300, easing: Easing.out(Easing.cubic) },
  },

  // Delays
  delay: {
    stagger: 50,
    staggerFast: 30,
    staggerSlow: 80,
  },
};

/**
 * Check if user prefers reduced motion
 */
export function useReducedMotionPreference(): boolean {
  return useReducedMotion();
}

/**
 * Hook for spring animations with reduced motion support
 */
export function useSpringAnimation(
  initialValue: number = 1,
  config: { damping?: number; stiffness?: number; mass?: number } = {}
) {
  const reducedMotion = useReducedMotionPreference();
  const value = useSharedValue(initialValue);

  const animate = (toValue: number, customConfig?: typeof config) => {
    if (reducedMotion) {
      value.value = toValue;
      return;
    }
    value.value = withSpring(toValue, { ...AnimationConfig.spring.gentle, ...config, ...customConfig });
  };

  const animateImmediate = (toValue: number) => {
    value.value = toValue;
  };

  return { value, animate, animateImmediate };
}

/**
 * Hook for timing animations with reduced motion support
 */
export function useTimingAnimation(
  initialValue: number = 0,
  config: { duration?: number; easing?: any } = {}
) {
  const reducedMotion = useReducedMotionPreference();
  const value = useSharedValue(initialValue);

  const animate = (toValue: number, customConfig?: typeof config) => {
    if (reducedMotion) {
      value.value = toValue;
      return;
    }
    value.value = withTiming(toValue, { ...AnimationConfig.timing.normal, ...config, ...customConfig });
  };

  return { value, animate };
}

/**
 * Scale animation hook for pressable components
 */
export function useScaleAnimation(scale: number = 1) {
  const reducedMotion = useReducedMotionPreference();
  const value = useSharedValue(scale);

  const pressIn = () => {
    if (reducedMotion) return;
    value.value = withSpring(0.96, AnimationConfig.spring.bouncy);
  };

  const pressOut = () => {
    if (reducedMotion) return;
    value.value = withSpring(1, AnimationConfig.spring.snappy);
  };

  const pressOutTo = (targetScale: number) => {
    if (reducedMotion) {
      value.value = targetScale;
      return;
    }
    value.value = withSpring(targetScale, AnimationConfig.spring.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: value.value }],
  }));

  return { value, pressIn, pressOut, pressOutTo, animatedStyle };
}

/**
 * Opacity animation hook
 */
export function useOpacityAnimation(initialValue: number = 1) {
  const reducedMotion = useReducedMotionPreference();
  const value = useSharedValue(initialValue);

  const fadeIn = (duration?: number) => {
    if (reducedMotion) {
      value.value = 1;
      return;
    }
    value.value = withTiming(1, { duration: duration || 250, easing: Easing.out(Easing.quad) });
  };

  const fadeOut = (duration?: number) => {
    if (reducedMotion) {
      value.value = 0;
      return;
    }
    value.value = withTiming(0, { duration: duration || 200, easing: Easing.in(Easing.quad) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: value.value,
  }));

  return { value, fadeIn, fadeOut, animatedStyle };
}

/**
 * Translation animation hook
 */
export function useTranslationAnimation() {
  const reducedMotion = useReducedMotionPreference();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const translateTo = (x: number, y: number, config?: { duration?: number; damping?: number; stiffness?: number }) => {
    if (reducedMotion) {
      translateX.value = x;
      translateY.value = y;
      return;
    }
    const springConfig = { ...AnimationConfig.spring.gentle, ...config };
    translateX.value = withSpring(x, springConfig);
    translateY.value = withSpring(y, springConfig);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return { translateX, translateY, translateTo, animatedStyle };
}

/**
 * Staggered animation for lists
 */
export function useStaggeredAnimation(
  itemsCount: number,
  baseDelay: number = AnimationConfig.delay.stagger
) {
  const reducedMotion = useReducedMotionPreference();
  const values = Array.from({ length: itemsCount }, (_, i) => useSharedValue(0));

  const animateIn = (staggerDelay?: number) => {
    const delay = staggerDelay || baseDelay;
    values.forEach((value, index) => {
      if (reducedMotion) {
        value.value = 1;
        return;
      }
      value.value = withDelay(
        index * delay,
        withSpring(1, AnimationConfig.spring.card)
      );
    });
  };

  const animateOut = (staggerDelay?: number) => {
    const delay = staggerDelay || baseDelay;
    values.forEach((value, index) => {
      if (reducedMotion) {
        value.value = 0;
        return;
      }
      value.value = withDelay(
        index * delay,
        withSpring(0, AnimationConfig.spring.snappy)
      );
    });
  };

  const animatedStyles = values.map(value =>
    useAnimatedStyle(() => ({
      opacity: value.value,
      transform: [{ translateY: (1 - value.value) * 20 }],
    }))
  );

  return { values, animateIn, animateOut, animatedStyles };
}

/**
 * Pulse animation for active states
 */
export function usePulseAnimation(
  isActive: boolean,
  minScale: number = 0.98,
  maxScale: number = 1.02
) {
  const reducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);

  // This would typically be used in a useEffect with isActive dependency
  // The actual animation trigger should be handled by the consumer

  const start = () => {
    if (reducedMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(minScale, { duration: 800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  };

  const stop = () => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    cancelAnimation(scale);
    scale.value = withSpring(1, AnimationConfig.spring.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, start, stop, animatedStyle };
}

/**
 * Morphing animation for shape transitions
 */
export function useMorphAnimation() {
  const reducedMotion = useReducedMotionPreference();
  const borderRadius = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const morphTo = (
    targetRadius: number,
    targetWidth: number,
    targetHeight: number,
    config?: { duration?: number }
  ) => {
    if (reducedMotion) {
      borderRadius.value = targetRadius;
      width.value = targetWidth;
      height.value = targetHeight;
      return;
    }
    const timingConfig = { duration: config?.duration || 300, easing: Easing.out(Easing.cubic) };
    borderRadius.value = withTiming(targetRadius, timingConfig);
    width.value = withTiming(targetWidth, timingConfig);
    height.value = withTiming(targetHeight, timingConfig);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    borderRadius: borderRadius.value,
    width: width.value || undefined,
    height: height.value || undefined,
  }));

  return { borderRadius, width, height, morphTo, animatedStyle };
}

/**
 * Progress ring animation
 */
export function useProgressRingAnimation() {
  const reducedMotion = useReducedMotionPreference();
  const progress = useSharedValue(0);

  const animateTo = (value: number, config?: { duration?: number; damping?: number; stiffness?: number }) => {
    if (reducedMotion) {
      progress.value = value;
      return;
    }
    progress.value = withSpring(value, { ...AnimationConfig.spring.gentle, ...config });
  };

  return { progress, animateTo };
}

/**
 * Shimmer loading animation
 */
export function useShimmerAnimation() {
  const reducedMotion = useReducedMotionPreference();
  const translateX = useSharedValue(-1);

  const start = () => {
    if (reducedMotion) return;
    translateX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0, easing: Easing.linear }),
        withTiming(2, { duration: 1500, easing: Easing.linear })
      ),
      -1
    );
  };

  const stop = () => {
    cancelAnimation(translateX);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 100 }],
  }));

  return { start, stop, animatedStyle };
}

/**
 * Combined animation style for complex components
 */
export function createAnimatedStyle(
  transforms: Record<string, any>[],
  opacity?: any
) {
  return useAnimatedStyle(() => ({
    transform: transforms,
    opacity: opacity?.value ?? 1,
  }));
}

/**
 * Layout animation for mount/unmount
 */
export function useLayoutAnimation() {
  const reducedMotion = useReducedMotionPreference();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(10);

  const mount = () => {
    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    scale.value = withSpring(1, AnimationConfig.spring.card);
    translateY.value = withSpring(0, AnimationConfig.spring.card);
  };

  const unmount = (onComplete?: () => void) => {
    if (reducedMotion) {
      opacity.value = 0;
      scale.value = 0.9;
      translateY.value = -10;
      runOnJS(onComplete)?.();
      return;
    }
    opacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) });
    scale.value = withSpring(0.9, AnimationConfig.spring.snappy);
    translateY.value = withSpring(-10, AnimationConfig.spring.snappy);
    // Note: onComplete would need to be handled separately
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return { opacity, scale, translateY, mount, unmount, animatedStyle };
}

/**
 * Floating animation for decorative elements
 */
export function useFloatingAnimation(
  amplitude: number = 10,
  duration: number = 3000
) {
  const reducedMotion = useReducedMotionPreference();
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const start = () => {
    if (reducedMotion) return;
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
        withTiming(amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: duration, easing: Easing.inOut(Easing.quad) }),
        withTiming(2, { duration: duration, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return { start, animatedStyle };
}

/**
 * Haptic feedback helper
 */
export const HapticFeedback = {
  light: () => {
    // Would use expo-haptics in actual implementation
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  heavy: () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  success: () => {
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning: () => {
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  error: () => {
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  selection: () => {
    // Haptics.selectionAsync();
  },
};

/**
 * Animation presets for common patterns
 */
export const AnimationPresets = {
  // Button press
  buttonPress: {
    pressIn: { scale: 0.96 },
    pressOut: { scale: 1 },
  },

  // Card hover/press
  cardPress: {
    pressIn: { scale: 0.98, shadowScale: 0.8 },
    pressOut: { scale: 1, shadowScale: 1 },
  },

  // Modal enter/exit
  modalEnter: {
    opacity: 1,
    scale: 1,
    translateY: 0,
  },
  modalExit: {
    opacity: 0,
    scale: 0.95,
    translateY: 20,
  },

  // List item enter
  listItemEnter: {
    opacity: 1,
    translateX: 0,
    translateY: 0,
  },
  listItemExit: {
    opacity: 0,
    translateX: -20,
    translateY: 0,
  },

  // Toast notification
  toastEnter: {
    opacity: 1,
    translateY: 0,
    scale: 1,
  },
  toastExit: {
    opacity: 0,
    translateY: -20,
    scale: 0.95,
  },
};

export default {
  useSpringAnimation,
  useTimingAnimation,
  useScaleAnimation,
  useOpacityAnimation,
  useTranslationAnimation,
  useStaggeredAnimation,
  usePulseAnimation,
  useMorphAnimation,
  useProgressRingAnimation,
  useShimmerAnimation,
  useLayoutAnimation,
  useFloatingAnimation,
  createAnimatedStyle,
  AnimationConfig,
  AnimationPresets,
  HapticFeedback,
};
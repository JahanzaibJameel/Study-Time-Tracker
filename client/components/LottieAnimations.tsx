import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

export function LottieAnimation({ width = 100, height = 100 }: any) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={require('../../assets/images/celebration.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

export function SuccessAnimation({ size = 100 }: any) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('../../assets/images/celebration.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

export const ErrorAnimation = SuccessAnimation;
export const LoadingAnimation = SuccessAnimation;
export const ConfettiAnimation = SuccessAnimation;
export const EmptyStateAnimation = SuccessAnimation;
export const OnboardingAnimation = SuccessAnimation;
export const ProgressAnimation = SuccessAnimation;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
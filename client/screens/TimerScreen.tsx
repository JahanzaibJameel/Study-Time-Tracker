import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Image, Modal } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  formatTime,
  addSession,
  getRandomMotivationalMessage,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type TimerRouteProp = RouteProp<RootStackParamList, "Timer">;

export default function TimerScreen() {
  const navigation = useNavigation();
  const route = useRoute<TimerRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const { subjectId, subjectName } = route.params;

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for timer when running
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isRunning]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(true);
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
  };

  const handleStop = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(false);

    if (seconds > 0) {
      await addSession(subjectId, subjectName, seconds);
      setMotivationalMessage(getRandomMotivationalMessage());
      setShowCompletion(true);
    } else {
      navigation.goBack();
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    navigation.goBack();
  };

  const minutes = Math.floor(seconds / 60);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: theme.backgroundDefault },
            pressed && { opacity: 0.7 },
          ]}
          testID="button-close-timer"
        >
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ThemedText type="h3" style={styles.subjectName}>
          {subjectName}
        </ThemedText>

        <Animated.View
          style={[
            styles.timerContainer,
            { backgroundColor: theme.cardBackground },
            Shadows.card,
            animatedStyle,
          ]}
        >
          <ThemedText type="h1" style={styles.timer}>
            {formatTime(seconds)}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.timerLabel, { color: theme.textSecondary }]}
          >
            {isRunning ? "Studying..." : "Ready to study"}
          </ThemedText>
        </Animated.View>

        <View style={styles.controls}>
          {!isRunning ? (
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.mainButton,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.7 },
              ]}
              testID="button-start-timer"
            >
              <Feather name="play" size={32} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePause}
              style={({ pressed }) => [
                styles.mainButton,
                { backgroundColor: theme.warning },
                pressed && { opacity: 0.7 },
              ]}
              testID="button-pause-timer"
            >
              <Feather name="pause" size={32} color="#FFFFFF" />
            </Pressable>
          )}

          <Pressable
            onPress={handleStop}
            style={({ pressed }) => [
              styles.stopButton,
              { backgroundColor: theme.backgroundDefault },
              pressed && { opacity: 0.7 },
            ]}
            testID="button-stop-timer"
          >
            <Feather name="square" size={24} color={theme.text} />
            <ThemedText style={styles.stopButtonText}>Stop</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Completion Modal */}
      <Modal
        visible={showCompletion}
        transparent
        animationType="fade"
        onRequestClose={handleCompletionClose}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundRoot },
              Shadows.card,
            ]}
          >
            <Image
              source={require("../../assets/images/celebration.png")}
              style={styles.celebrationImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.completionTitle}>
              Great Job!
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.completionTime, { color: theme.primary }]}
            >
              You studied for {minutes} minute{minutes !== 1 ? "s" : ""}
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.motivationalText, { color: theme.textSecondary }]}
            >
              {motivationalMessage}
            </ThemedText>
            <Button onPress={handleCompletionClose} style={styles.doneButton}>
              Done
            </Button>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  subjectName: {
    marginBottom: Spacing["3xl"],
    textAlign: "center",
  },
  timerContainer: {
    width: 220,
    height: 220,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["4xl"],
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    letterSpacing: 2,
  },
  timerLabel: {
    marginTop: Spacing.sm,
  },
  controls: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  stopButtonText: {
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  celebrationImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  completionTitle: {
    marginBottom: Spacing.sm,
  },
  completionTime: {
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  motivationalText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  doneButton: {
    width: "100%",
  },
});

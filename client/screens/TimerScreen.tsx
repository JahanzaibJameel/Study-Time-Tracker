import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TextInput,
} from "react-native";
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
import { Spacing, BorderRadius, Shadows, TimerSizes } from "@/constants/theme";
import {
  formatTime,
  addSession,
  getRandomMotivationalMessage,
  formatDuration,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useWidgetTrigger } from "@/widgets/hooks";
import { SuccessAnimation } from "@/components/LottieAnimations";

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
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const triggerWidgetSync = useWidgetTrigger();
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Pulse animation for timer when running
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isRunning, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (isMountedRef.current) {
        setSeconds(elapsed);
      }
    };

    // Initial update
    updateTimer();

    // High frequency for smooth UI (100ms = 10fps)
    const id = setInterval(updateTimer, 100);

    return () => clearInterval(id);
  }, [isRunning]);

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimeRef.current = Date.now() - seconds * 1000;
    setIsRunning(true);
  }, [seconds]);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
  }, []);

  const handleStop = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(false);

    if (seconds > 0) {
      setShowNotesModal(true);
    } else {
      navigation.goBack();
    }
  }, [seconds, navigation]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCompletionClose = useCallback(() => {
    setShowCompletion(false);
    navigation.goBack();
  }, [navigation]);

  const handleSaveNotes = useCallback(async () => {
    setShowNotesModal(false);
    setError(null);
    const result = await addSession(
      subjectId,
      subjectName,
      seconds,
      sessionNotes.trim() || undefined,
    );
    if (result.ok) {
      setMotivationalMessage(getRandomMotivationalMessage());
      setShowCompletion(true);
      setSessionNotes("");
      // Sync widget data in background
      triggerWidgetSync();
    } else {
      if (__DEV__) console.error("Failed to save session:", result.error);
    }
  }, [
    subjectId,
    subjectName,
    seconds,
    sessionNotes,
    navigation,
    triggerWidgetSync,
  ]);

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
          accessibilityLabel="Close timer"
          accessibilityRole="button"
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
              accessibilityLabel="Start study session"
              accessibilityRole="button"
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
              accessibilityLabel="Pause study session"
              accessibilityRole="button"
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
            accessibilityLabel="Stop and save study session"
            accessibilityRole="button"
          >
            <Feather name="square" size={24} color={theme.text} />
            <ThemedText style={styles.stopButtonText}>Stop</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        transparent
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.notesModalOverlay}>
          <View
            style={[
              styles.notesModalContent,
              { backgroundColor: theme.backgroundRoot },
            ]}
          >
            <View style={styles.notesModalHeader}>
              <ThemedText type="h3" style={styles.notesModalTitle}>
                Add Notes (Optional)
              </ThemedText>
              <Pressable
                onPress={() => setShowNotesModal(false)}
                style={({ pressed }) => [
                  styles.notesCloseButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                accessibilityLabel="Close notes"
                accessibilityRole="button"
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="What did you work on? (e.g., Chapter 3 exercises, Reviewed flashcards)"
              placeholderTextColor={theme.textSecondary}
              value={sessionNotes}
              onChangeText={(text) => {
                setSessionNotes(text);
                if (error) setError(null);
              }}
              multiline
              maxLength={500}
              autoFocus
            />
            <View style={styles.notesModalFooter}>
              <Button
                onPress={() => setShowNotesModal(false)}
                variant="secondary"
                style={styles.notesCancelButton}
              >
                Skip
              </Button>
              <Button onPress={handleSaveNotes} style={styles.notesSaveButton}>
                Save Session
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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
            <SuccessAnimation size={120} />
            <ThemedText type="h3" style={styles.completionTitle}>
              Great Job!
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.completionTime, { color: theme.primary }]}
            >
              You studied for {formatDuration(seconds)}
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
    fontWeight: "600",
  },
  timerContainer: {
    width: TimerSizes.container,
    height: TimerSizes.container,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["4xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timer: {
    fontSize: TimerSizes.fontSize,
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
  notesModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  notesModalContent: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "80%",
  },
  notesModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  notesModalTitle: {
    fontWeight: "600",
  },
  notesCloseButton: {
    padding: Spacing.xs,
  },
  notesInput: {
    padding: Spacing.lg,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: "top",
  },
  notesModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  notesCancelButton: {
    flex: 1,
    marginRight: Spacing.md,
  },
  notesSaveButton: {
    flex: 1,
    marginLeft: Spacing.md,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  celebrationImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  completionTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
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
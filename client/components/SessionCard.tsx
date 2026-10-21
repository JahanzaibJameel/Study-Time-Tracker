import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { StudySession, formatMinutes } from "@/lib/storage";
import { useReducedMotionPreference } from "@/lib/animations";

interface SessionCardProps {
  session: StudySession & { subjectName: string };
  onDelete?: (sessionId: string) => void;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotionPreference();
  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.5; // 50% of width

  const translateX = useSharedValue(0);
  const dragProgress = useSharedValue(0); // 0 to 1 as swipe progresses

  const panGestureHandler = {
    onStart: (_: any, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event: any, context: any) => {
      const movement = event.translationX;
      translateX.value = context.startX + movement;

      const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
      dragProgress.value = translateX.value < 0 ? progress : 0;
    },
    onEnd: () => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        if (reducedMotion) {
          translateX.value = -SCREEN_WIDTH;
        } else {
          translateX.value = withSpring(-SCREEN_WIDTH, {
            damping: 20,
            stiffness: 150,
          });
        }
        if (onDelete && session.id) {
          onDelete(session.id);
        }
      } else {
        if (reducedMotion) {
          translateX.value = 0;
        } else {
          translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 150,
          });
        }
        dragProgress.value = 0;
      }
    },
  } as any;

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Background style (delete background)
  const backgroundStyle = {
    opacity: dragProgress.value,
    backgroundColor: theme.error,
  };

  const iconStyle = {
    opacity: dragProgress.value,
    transform: [
      {
        translateX: dragProgress.value > 0 ? -20 : 0,
      },
    ],
  };

  const minutes = Math.floor(session.duration / 60);
  const hasNotes = session.notes && session.notes.trim().length > 0;
  const hasTags = session.tags && session.tags.length > 0;

  return (
    <View style={styles.wrapper}>
      {/* Background for swipe actions */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Feather name="trash-2" size={24} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      {/* Card content */}
      <PanGestureHandler onGestureEvent={panGestureHandler as any}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground },
            Shadows.small,
            animatedContainerStyle,
          ]}
        >
          <View style={styles.left}>
            <View
              style={[styles.iconContainer, { backgroundColor: theme.primary }]}
            >
              <Feather name="book-open" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <ThemedText type="body" style={styles.subjectName}>
                {session.subjectName}
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.timeAgo, { color: theme.textSecondary }]}
              >
                {getTimeAgo(session.date)}
              </ThemedText>
              {hasNotes && (
                <ThemedText
                  type="small"
                  style={[
                    styles.notesText,
                    { color: theme.textSecondary, marginTop: Spacing.xs },
                  ]}
                  numberOfLines={2}
                >
                  {session.notes}
                </ThemedText>
              )}
              {hasTags && (
                <View style={styles.tagsContainer}>
                  {session.tags!.slice(0, 3).map((tag, index) => (
                    <ThemedText
                      key={index}
                      type="small"
                      style={[
                        styles.tag,
                        { backgroundColor: theme.primary, color: "#FFFFFF" },
                      ]}
                    >
                      #{tag}
                    </ThemedText>
                  ))}
                  {session.tags!.length > 3 && (
                    <ThemedText
                      type="small"
                      style={[
                        styles.tag,
                        { backgroundColor: theme.textSecondary, color: "#FFFFFF" },
                      ]}
                    >
                      +{session.tags!.length - 3}
                    </ThemedText>
                  )}
                </View>
              )}
            </View>
          </View>
          <ThemedText
            type="body"
            style={[styles.duration, { color: theme.primary }]}
          >
            {formatMinutes(minutes)}
          </ThemedText>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    backgroundColor: "transparent", // we'll set backgroundColor in the component
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  subjectName: {
    fontWeight: "500",
  },
  timeAgo: {},
  duration: {
    fontWeight: "600",
  },
  notesText: {
    fontStyle: "italic",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    fontSize: 11,
    fontWeight: "500",
  },
  background: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: Spacing.lg,
  },
});

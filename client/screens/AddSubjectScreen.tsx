import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { addSubject } from "@/lib/storage";

export default function AddSubjectScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await addSubject(name);
      if (result.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
      } else {
        setError(result.error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add subject";
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <ThemedText type="body" style={styles.label}>
          Subject Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: error ? theme.warning : theme.border,
            },
          ]}
          placeholder="e.g., Mathematics, History, Biology..."
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) setError(null);
          }}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
          testID="input-subject-name"
          accessibilityLabel="Subject name input"
        />
        {error ? (
          <ThemedText
            type="small"
            style={[
              styles.errorText,
              { color: theme.warning, marginTop: Spacing.xs },
            ]}
          >
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            disabled={!isValid || isSaving}
            style={styles.saveButton}
          >
            {isSaving ? "Saving..." : "Add Subject"}
          </Button>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  saveButton: {
    width: "100%",
  },
});

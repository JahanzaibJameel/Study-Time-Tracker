import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import TimerScreen from "@/screens/TimerScreen";
import PomodoroScreen from "@/screens/PomodoroScreen";
import AddSubjectScreen from "@/screens/AddSubjectScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AchievementsScreen from "@/screens/AchievementsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  Timer: {
    subjectId: string;
    subjectName: string;
  };
  Pomodoro: {
    subjectId: string;
    subjectName: string;
  };
  AddSubject: undefined;
  Settings: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Pomodoro"
        component={PomodoroScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddSubject"
        component={AddSubjectScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Subject",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          presentation: "modal",
          headerTitle: "Achievements",
        }}
      />
    </Stack.Navigator>
  );
}

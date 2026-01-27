import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import TimerScreen from "@/screens/TimerScreen";
import AddSubjectScreen from "@/screens/AddSubjectScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  Timer: {
    subjectId: string;
    subjectName: string;
  };
  AddSubject: undefined;
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
        name="AddSubject"
        component={AddSubjectScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Subject",
        }}
      />
    </Stack.Navigator>
  );
}

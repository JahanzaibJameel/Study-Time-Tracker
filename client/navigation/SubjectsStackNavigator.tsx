import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import SubjectsScreen from "@/screens/SubjectsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export type SubjectsStackParamList = {
  Subjects: undefined;
};

const Stack = createNativeStackNavigator<SubjectsStackParamList>();

function AddSubjectButton() {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      onPress={() => navigation.navigate("AddSubject")}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      testID="button-add-subject"
    >
      <Feather name="plus" size={24} color={theme.text} />
    </Pressable>
  );
}

export default function SubjectsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Subjects"
        component={SubjectsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Subjects" />,
          headerRight: () => <AddSubjectButton />,
        }}
      />
    </Stack.Navigator>
  );
}

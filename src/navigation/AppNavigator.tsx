import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../screens/DashboardScreen";
import HabitDetailScreen from "../screens/HabitDetailScreen";
import HabitHistoryScreen from "../screens/HabitHistoryScreen";
import SleepTrackerScreen from "../screens/SleepTrackerScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StatsScreen from "../screens/StatsScreen";
import CompletedHabitsScreen from "../screens/CompletedHabitsScreen";

export type RootStackParamList = {
  Dashboard: undefined;
  HabitDetail: { habitId: string };
  HabitHistory: { habitId: string };
  SleepTracker: undefined;
  Settings: undefined;
  Stats: undefined;
  CompletedHabits: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#f9fafb" },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
        <Stack.Screen name="HabitHistory" component={HabitHistoryScreen} />
        <Stack.Screen name="SleepTracker" component={SleepTrackerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen
          name="CompletedHabits"
          component={CompletedHabitsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

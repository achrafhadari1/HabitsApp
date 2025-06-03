import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import AddHabitModal from "../components/AddHabitModal";
import {
  getCurrentDateString,
  shouldTrackHabitOnDate,
  isHabitCompletedForPeriod,
  getHabitProgressText,
  getScheduleDisplayText,
} from "../utils/scheduleUtils";

type DashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

const DashboardScreen: React.FC = () => {
  const { habits, sleepData, userProfile } = useHabits();
  const navigation = useNavigation<DashboardNavigationProp>();
  const [showAddModal, setShowAddModal] = useState(false);
  const today = new Date();
  const formattedToday = getCurrentDateString();

  // Filter habits that should be tracked today
  const trackableHabits = habits.filter((habit) =>
    shouldTrackHabitOnDate(habit, today)
  );

  // Filter for completed habits today (considering their schedule)
  const completedHabits = trackableHabits.filter((habit) =>
    isHabitCompletedForPeriod(habit, today)
  );

  // Find ongoing habits (trackable but not completed)
  const ongoingHabits = trackableHabits.filter(
    (habit) => !isHabitCompletedForPeriod(habit, today)
  );

  // Habits not scheduled for today
  const notScheduledHabits = habits.filter(
    (habit) => !shouldTrackHabitOnDate(habit, today)
  );

  const renderHabitCard = (habit: any, isScheduled: boolean = true) => {
    const currentValue = habit.entries[formattedToday] || 0;
    const progressText = getHabitProgressText(habit, today);
    const scheduleText = getScheduleDisplayText(habit);
    const isNoSmoking =
      habit.name.toLowerCase().includes("cigarette") ||
      habit.name.toLowerCase().includes("smoke");
    const isWater = habit.name.toLowerCase().includes("water");
    const isYoga =
      habit.name.toLowerCase().includes("yoga") ||
      habit.name.toLowerCase().includes("stretch");

    if (isNoSmoking) {
      return (
        <TouchableOpacity
          key={habit.id}
          style={styles.noCigaretteCard}
          onPress={() =>
            navigation.navigate("HabitDetail", { habitId: habit.id })
          }
        >
          <View style={styles.habitCardHeader}>
            <Ionicons name="ban" size={20} color="white" />
            <Text style={styles.noCigaretteText}>no cigarettes</Text>
          </View>
          <Text style={styles.noCigaretteProgress}>{progressText}</Text>
          {!isScheduled && (
            <Text style={styles.scheduleInfo}>{scheduleText}</Text>
          )}
        </TouchableOpacity>
      );
    } else if (isYoga) {
      return (
        <TouchableOpacity
          key={habit.id}
          style={styles.yogaCard}
          onPress={() =>
            navigation.navigate("HabitDetail", { habitId: habit.id })
          }
        >
          <View style={styles.habitCardContent}>
            <View style={styles.habitCardHeader}>
              <Ionicons name="fitness" size={20} color="#92400e" />
              <Text style={styles.yogaText}>yoga</Text>
            </View>
            <Text style={styles.yogaTime}>
              {isScheduled ? `${habit.target} min` : progressText}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else if (isWater) {
      return (
        <TouchableOpacity
          key={habit.id}
          style={styles.waterCard}
          onPress={() =>
            navigation.navigate("HabitDetail", { habitId: habit.id })
          }
        >
          <View style={styles.habitCardHeader}>
            <Ionicons name="water" size={20} color="#1e40af" />
            <Text style={styles.waterText}>water</Text>
          </View>

          <View style={styles.waterStats}>
            <View style={styles.waterStat}>
              <Text style={styles.waterStatLabel}>glasses</Text>
              <Text style={styles.waterStatValue}>
                {isScheduled
                  ? `${currentValue} / ${habit.target}`
                  : progressText}
              </Text>
            </View>
            <View style={styles.waterStat}>
              <Text style={styles.waterStatLabel}>max</Text>
              <Text style={styles.waterStatValue}>17 glasses</Text>
            </View>
            <View style={styles.waterStat}>
              <Text style={styles.waterStatLabel}>streaks</Text>
              <Text style={styles.waterStatValue}>10 days</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          key={habit.id}
          style={styles.defaultCard}
          onPress={() =>
            navigation.navigate("HabitDetail", { habitId: habit.id })
          }
        >
          <View style={styles.habitCardContent}>
            <View style={styles.habitCardHeader}>
              <Ionicons name="fitness" size={20} color="#374151" />
              <Text style={styles.defaultText}>{habit.name.toLowerCase()}</Text>
            </View>
            <Text style={styles.defaultTarget}>
              {isScheduled ? `${habit.target} ${habit.unit}` : progressText}
            </Text>
            {!isScheduled && (
              <Text style={styles.scheduleInfo}>{scheduleText}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.statusBarSpacer} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with profile */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
                }}
                style={styles.profileImage}
              />
            </View>
            <View>
              <Text style={styles.greeting}>
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                  ? "afternoon"
                  : "evening"}
                ,
              </Text>
              <Text style={styles.name}>{userProfile.name}</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("CompletedHabits")}
              style={styles.headerButton}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={16}
                color="#374151"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Stats")}
              style={styles.headerButton}
            >
              <Ionicons name="analytics-outline" size={16} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={styles.headerButton}
            >
              <Ionicons name="settings-outline" size={16} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.headerButton}
            >
              <Ionicons name="add" size={16} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.trackLabel}>track</Text>
          <Text style={styles.title}>your habits</Text>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>
                {Math.round(
                  (completedHabits.length / trackableHabits.length) * 100
                ) || 0}
                %
              </Text>
              <Text style={styles.quickStatLabel}>Today</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>
                {trackableHabits.length}
              </Text>
              <Text style={styles.quickStatLabel}>Active</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>
                {completedHabits.length}
              </Text>
              <Text style={styles.quickStatLabel}>Done</Text>
            </View>
          </View>

          {/* Ongoing Habits */}
          <View style={styles.habitsContainer}>
            {ongoingHabits.map((habit) => renderHabitCard(habit, true))}
          </View>

          {/* Not Scheduled Today */}
          {notScheduledHabits.length > 0 && (
            <View style={styles.notScheduledSection}>
              <Text style={styles.notScheduledTitle}>Not scheduled today</Text>
              <View style={styles.habitsContainer}>
                {notScheduledHabits.map((habit) =>
                  renderHabitCard(habit, false)
                )}
              </View>
            </View>
          )}
        </View>

        {/* Sleep Tracker Section */}
        <View style={styles.sleepSection}>
          <View style={styles.sleepHeader}>
            <View style={styles.sleepTitleContainer}>
              <Ionicons name="moon" size={18} color="#374151" />
              <Text style={styles.sleepTitle}>sleep</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("SleepTracker")}
              style={styles.sleepButton}
            >
              <Ionicons name="chevron-forward" size={14} color="#374151" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sleepCard}
            onPress={() => navigation.navigate("SleepTracker")}
          >
            <Text style={styles.sleepCardText}>Track your sleep patterns</Text>
            <Text style={styles.sleepCardSubtext}>
              {sleepData.length > 0
                ? `${sleepData.length} entries recorded`
                : "No sleep data yet"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Completed Habits Section */}
        <View style={styles.completedSection}>
          <View style={styles.completedHeader}>
            <Text style={styles.completedTitle}>habits completed</Text>
            <TouchableOpacity style={styles.completedButton}>
              <Ionicons name="chevron-forward" size={14} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.completedList}>
            {completedHabits.length === 0 ? (
              <Text style={styles.noCompletedText}>
                No habits completed today yet
              </Text>
            ) : (
              completedHabits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() =>
                    navigation.navigate("HabitDetail", { habitId: habit.id })
                  }
                  style={styles.completedItem}
                >
                  <View style={styles.completedIcon}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  <View style={styles.completedInfo}>
                    <Text style={styles.completedName}>
                      {habit.name.toLowerCase()}
                    </Text>
                  </View>
                  <Text style={styles.completedTarget}>
                    {habit.target} {habit.unit}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  statusBarSpacer: {
    height: 20, // Extra space below status bar
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fef2f2",
    marginRight: 12,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  greeting: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "300",
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  trackLabel: {
    color: "#6b7280",
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "300",
  },
  title: {
    fontSize: 64,
    fontWeight: "100",
    lineHeight: 64,
    color: "#111827",
    marginBottom: 16,
  },
  habitsContainer: {
    gap: 12,
  },
  noCigaretteCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#000000",
  },
  habitCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noCigaretteText: {
    color: "#ffffff",
    fontWeight: "300",
    marginLeft: 8,
    fontSize: 16,
  },
  noCigaretteProgress: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "300",
    marginTop: 4,
  },
  yogaCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  habitCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  yogaText: {
    color: "#92400e",
    fontWeight: "300",
    marginLeft: 8,
    fontSize: 16,
  },
  yogaTime: {
    color: "#92400e",
    fontWeight: "300",
    fontSize: 16,
  },
  waterCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  waterText: {
    color: "#374151",
    fontWeight: "300",
    marginLeft: 8,
    fontSize: 16,
  },
  waterStats: {
    flexDirection: "row",
    marginTop: 12,
    gap: 24,
  },
  waterStat: {
    flex: 1,
  },
  waterStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  waterStatValue: {
    fontWeight: "300",
    color: "#1e40af",
    fontSize: 14,
  },
  defaultCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  defaultText: {
    color: "#374151",
    fontWeight: "300",
    marginLeft: 8,
    fontSize: 16,
  },
  defaultTarget: {
    color: "#374151",
    fontWeight: "300",
    fontSize: 16,
  },
  completedSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  completedTitle: {
    fontWeight: "300",
    fontSize: 18,
    color: "#111827",
  },
  completedButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  completedList: {
    gap: 8,
  },
  noCompletedText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "300",
  },
  completedItem: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
  },
  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#000000",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  completedInfo: {
    flex: 1,
  },
  completedName: {
    fontSize: 14,
    fontWeight: "300",
    color: "#111827",
  },
  completedTarget: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "300",
  },
  sleepSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sleepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sleepTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sleepTitle: {
    fontSize: 18,
    fontWeight: "300",
    marginLeft: 8,
    color: "#374151",
  },
  sleepButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sleepCard: {
    backgroundColor: "#f0f4f4",
    padding: 16,
    borderRadius: 12,
  },
  sleepCardText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#374151",
    marginBottom: 4,
  },
  sleepCardSubtext: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "300",
  },
  notScheduledSection: {
    marginTop: 24,
  },
  notScheduledTitle: {
    fontSize: 16,
    fontWeight: "300",
    color: "#6b7280",
    marginBottom: 12,
  },
  scheduleInfo: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "300",
    marginTop: 4,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
  },
  quickStatCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
});

export default DashboardScreen;

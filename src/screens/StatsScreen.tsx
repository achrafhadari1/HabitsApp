import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getCurrentDateString,
  getDateString,
  shouldTrackHabitOnDate,
  isHabitCompletedForPeriod,
} from "../utils/scheduleUtils";
import {
  subDays,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

type StatsNavigationProp = StackNavigationProp<RootStackParamList, "Stats">;

const { width } = Dimensions.get("window");

const StatsScreen: React.FC = () => {
  const navigation = useNavigation<StatsNavigationProp>();
  const { habits } = useHabits();

  const today = new Date();
  const todayStr = getCurrentDateString();

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalHabits = habits.length;
    const activeHabits = habits.filter((habit) =>
      shouldTrackHabitOnDate(habit, today)
    ).length;

    // Calculate completion rate for today
    const todayCompletions = habits.filter((habit) => {
      if (!shouldTrackHabitOnDate(habit, today)) return false;
      return isHabitCompletedForPeriod(habit, today);
    }).length;

    const todayCompletionRate =
      activeHabits > 0
        ? Math.round((todayCompletions / activeHabits) * 100)
        : 0;

    // Calculate 7-day streak
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = getDateString(date);
      const scheduledHabits = habits.filter((habit) =>
        shouldTrackHabitOnDate(habit, date)
      );

      if (scheduledHabits.length === 0) continue;

      const completedHabits = scheduledHabits.filter((habit) =>
        isHabitCompletedForPeriod(habit, date)
      );

      const dayCompletionRate = completedHabits.length / scheduledHabits.length;

      if (dayCompletionRate >= 0.8) {
        // 80% completion rate
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalHabits,
      activeHabits,
      todayCompletionRate,
      currentStreak,
    };
  }, [habits, today]);

  // Calculate habit-specific stats
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const entries = Object.entries(habit.entries);
      const totalEntries = entries.length;

      // Calculate total value (for quantity/duration habits)
      const totalValue = entries.reduce((sum, [_, value]) => sum + value, 0);

      // Calculate streak
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i);
        if (!shouldTrackHabitOnDate(habit, date)) continue;

        if (isHabitCompletedForPeriod(habit, date)) {
          streak++;
        } else {
          break;
        }
      }

      // Calculate weekly progress
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const weeklyProgress = weekDays.map((date) => {
        const dateStr = getDateString(date);
        const isScheduled = shouldTrackHabitOnDate(habit, date);
        const isCompleted =
          isScheduled && isHabitCompletedForPeriod(habit, date);
        const value = habit.entries[dateStr] || 0;

        return {
          date,
          dateStr,
          isScheduled,
          isCompleted,
          value,
          dayName: format(date, "EEE"),
        };
      });

      return {
        ...habit,
        totalEntries,
        totalValue,
        streak,
        weeklyProgress,
        averageValue:
          totalEntries > 0
            ? Math.round((totalValue / totalEntries) * 10) / 10
            : 0,
      };
    });
  }, [habits, today]);

  // Group habits by category for better organization
  const habitsByCategory = useMemo(() => {
    const categories: { [key: string]: typeof habitStats } = {};

    habitStats.forEach((habit) => {
      const category = habit.category || "Other";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(habit);
    });

    return categories;
  }, [habitStats]);

  const renderWeeklyChart = (weeklyProgress: any[]) => {
    const maxValue = Math.max(...weeklyProgress.map((day) => day.value), 1);
    const chartHeight = 50;

    return (
      <View style={styles.weeklyChart}>
        {/* Line Chart Container */}
        <View style={[styles.lineChartContainer, { height: chartHeight }]}>
          {/* Draw line connecting points */}
          <View style={styles.lineContainer}>
            {weeklyProgress.map((day, index) => {
              if (index === weeklyProgress.length - 1) return null;

              const currentY = day.isScheduled
                ? chartHeight - (day.value / maxValue) * (chartHeight - 10)
                : chartHeight - 5;
              const nextDay = weeklyProgress[index + 1];
              const nextY = nextDay.isScheduled
                ? chartHeight - (nextDay.value / maxValue) * (chartHeight - 10)
                : chartHeight - 5;

              const lineWidth = (width - 80) / 6; // Approximate width between points
              const angle =
                Math.atan2(nextY - currentY, lineWidth) * (180 / Math.PI);
              const lineLength = Math.sqrt(
                Math.pow(lineWidth, 2) + Math.pow(nextY - currentY, 2)
              );

              return (
                <View
                  key={index}
                  style={[
                    styles.chartLine,
                    {
                      left: index * lineWidth + 10,
                      top: currentY,
                      width: lineLength,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Draw points */}
          {weeklyProgress.map((day, index) => {
            const pointY = day.isScheduled
              ? chartHeight - (day.value / maxValue) * (chartHeight - 10)
              : chartHeight - 5;
            const isToday =
              format(day.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            const pointWidth = (width - 80) / 7;

            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.chartPoint,
                  {
                    left: index * pointWidth + 5,
                    top: pointY - 3,
                    backgroundColor: day.isCompleted
                      ? "#374151"
                      : day.isScheduled
                      ? "#9ca3af"
                      : "#e5e7eb",
                  },
                  isToday && styles.chartPointToday,
                ]}
              />
            );
          })}
        </View>

        {/* Day labels */}
        <View style={styles.chartLabels}>
          {weeklyProgress.map((day, index) => {
            const isToday =
              format(day.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

            return (
              <Text
                key={`label-${index}`}
                style={[
                  styles.chartDayLabel,
                  isToday && styles.chartDayLabelToday,
                ]}
              >
                {day.dayName}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Statistics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statValue}>
                {overallStats.todayCompletionRate}%
              </Text>
              <Text style={styles.statLabel}>Today's Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{overallStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="list" size={24} color="#6366f1" />
              <Text style={styles.statValue}>{overallStats.activeHabits}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{overallStats.totalHabits}</Text>
              <Text style={styles.statLabel}>Total Habits</Text>
            </View>
          </View>
        </View>

        {/* Habit Details by Category */}
        {Object.entries(habitsByCategory).map(([category, categoryHabits]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {categoryHabits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitTarget}>
                      Target: {habit.target} {habit.unit}
                    </Text>
                  </View>
                  <View style={styles.habitStats}>
                    <View style={styles.habitStat}>
                      <Text style={styles.habitStatValue}>{habit.streak}</Text>
                      <Text style={styles.habitStatLabel}>Streak</Text>
                    </View>
                    {habit.trackingType !== "completion" && (
                      <View style={styles.habitStat}>
                        <Text style={styles.habitStatValue}>
                          {habit.trackingType === "duration"
                            ? `${habit.totalValue}m`
                            : habit.trackingType === "quantity"
                            ? `${habit.totalValue}${habit.unit}`
                            : habit.totalValue}
                        </Text>
                        <Text style={styles.habitStatLabel}>Total</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Weekly Progress Chart */}
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>This Week</Text>
                  {renderWeeklyChart(habit.weeklyProgress)}
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  statusBarSpacer: {
    height: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  habitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  habitTarget: {
    fontSize: 12,
    color: "#6b7280",
  },
  habitStats: {
    flexDirection: "row",
  },
  habitStat: {
    alignItems: "center",
    marginLeft: 16,
  },
  habitStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  habitStatLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 12,
  },
  weeklyChart: {
    height: 80,
    marginBottom: 8,
  },
  lineChartContainer: {
    position: "relative",
    marginBottom: 8,
  },
  lineContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#374151",
    transformOrigin: "left center",
  },
  chartPoint: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  chartPointToday: {
    borderColor: "#374151",
    borderWidth: 3,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  chartDayLabel: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    flex: 1,
  },
  chartDayLabelToday: {
    color: "#111827",
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});

export default StatsScreen;

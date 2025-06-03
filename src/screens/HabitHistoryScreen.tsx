import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  shouldTrackHabitOnDate,
  isHabitCompletedForPeriod,
  getScheduleDisplayText,
} from "../utils/scheduleUtils";

type HabitHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HabitHistory"
>;
type HabitHistoryRouteProp = RouteProp<RootStackParamList, "HabitHistory">;

const HabitHistoryScreen: React.FC = () => {
  const navigation = useNavigation<HabitHistoryNavigationProp>();
  const route = useRoute<HabitHistoryRouteProp>();
  const { habitId } = route.params;
  const { getHabitById } = useHabits();

  const habit = getHabitById(habitId);

  // Memoize calendar calculations to prevent unnecessary re-renders
  const { today, currentMonth, monthEnd, daysInMonth } = useMemo(() => {
    const todayDate = new Date();
    const monthStart = startOfMonth(todayDate);
    const monthEndDate = endOfMonth(todayDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEndDate });

    return {
      today: todayDate,
      currentMonth: monthStart,
      monthEnd: monthEndDate,
      daysInMonth: days,
    };
  }, []); // Empty dependency array - only calculate once per mount

  // Memoize calendar day data to prevent calendar switching
  const calendarDayData = useMemo(() => {
    return daysInMonth.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayNumber = format(date, "d");
      const isToday =
        format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      const shouldTrack = shouldTrackHabitOnDate(habit, date);
      const entryValue = habit.entries[dateStr] || 0;
      const isCompleted = shouldTrack && entryValue >= habit.target;
      const hasEntry = shouldTrack && entryValue > 0;
      const isNotScheduled = !shouldTrack;

      return {
        date,
        dateStr,
        dayNumber,
        isToday,
        shouldTrack,
        entryValue,
        isCompleted,
        hasEntry,
        isNotScheduled,
      };
    });
  }, [daysInMonth, habit.entries, habit.target, today]);

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Habit not found</Text>
      </SafeAreaView>
    );
  }

  const isWater = habit.name.toLowerCase().includes("water");

  const renderCalendarDay = (dayData: any, index: number) => {
    const { dayNumber, isToday, isCompleted, hasEntry, isNotScheduled } =
      dayData;

    // Determine the primary state for styling (priority order)
    let dayStyle = styles.calendarDay;
    let textStyle = styles.calendarDayText;

    if (isNotScheduled) {
      dayStyle = [styles.calendarDay, styles.calendarDayNotScheduled];
      textStyle = [styles.calendarDayText, styles.calendarDayTextNotScheduled];
    } else if (isCompleted) {
      dayStyle = [styles.calendarDay, styles.calendarDayCompleted];
      textStyle = [styles.calendarDayText, styles.calendarDayTextCompleted];
    } else if (hasEntry) {
      dayStyle = [styles.calendarDay, styles.calendarDayPartial];
      textStyle = [styles.calendarDayText, styles.calendarDayTextPartial];
    }

    // Apply today styling as overlay if it's today
    if (isToday) {
      dayStyle = [dayStyle, styles.calendarDayToday];
      textStyle = [textStyle, styles.calendarDayTextToday];
    }

    return (
      <View key={`day-${index}`} style={dayStyle}>
        <Text style={textStyle}>{dayNumber}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isWater && styles.waterContainer]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isWater ? "#dbeafe" : "#ffffff"}
      />
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.habitInfo}>
          <Ionicons name="water" size={16} color="#6b7280" />
          <Text style={styles.habitName}>{habit.name.toLowerCase()}</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* History Title */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyLabel}>habit</Text>
          <Text style={styles.historyTitle}>history</Text>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarGrid}>
            {/* Add empty cells for proper alignment */}
            {Array.from({ length: currentMonth.getDay() }, (_, index) => (
              <View key={`empty-${index}`} style={styles.calendarDay} />
            ))}

            {calendarDayData.map((dayData, index) =>
              renderCalendarDay(dayData, index)
            )}
          </View>
        </View>

        {/* Schedule Info */}
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleTitle}>
            Schedule: {getScheduleDisplayText(habit)}
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotEmpty]} />
            <Text style={styles.legendText}>No activity</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotPartial]} />
            <Text style={styles.legendText}>Partial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotCompleted]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotNotScheduled]} />
            <Text style={styles.legendText}>Not scheduled</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                Object.entries(habit.entries).filter(([dateStr, value]) => {
                  const date = new Date(dateStr);
                  return (
                    shouldTrackHabitOnDate(habit, date) && value >= habit.target
                  );
                }).length
              }
            </Text>
            <Text style={styles.statLabel}>Days completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(() => {
                const scheduledDays = daysInMonth.filter((date) =>
                  shouldTrackHabitOnDate(habit, date)
                );
                const completedDays = Object.entries(habit.entries).filter(
                  ([dateStr, value]) => {
                    const date = new Date(dateStr);
                    return (
                      shouldTrackHabitOnDate(habit, date) &&
                      value >= habit.target
                    );
                  }
                ).length;
                return Math.round(
                  (completedDays / Math.max(scheduledDays.length, 1)) * 100
                );
              })()}
              %
            </Text>
            <Text style={styles.statLabel}>Success rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.entries(habit.entries).reduce((sum, [dateStr, value]) => {
                const date = new Date(dateStr);
                return shouldTrackHabitOnDate(habit, date) ? sum + value : sum;
              }, 0)}
            </Text>
            <Text style={styles.statLabel}>Total {habit.unit}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  waterContainer: {
    backgroundColor: "#dbeafe",
  },
  statusBarSpacer: {
    height: 20, // Extra space below status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  habitInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  habitName: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
    fontWeight: "400",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyHeader: {
    marginBottom: 30,
  },
  historyLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "300",
  },
  historyTitle: {
    fontSize: 32,
    color: "#111827",
    fontWeight: "300",
    marginTop: 2,
  },
  calendarContainer: {
    marginBottom: 30,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calendarDay: {
    width: "13%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderRadius: 20,
  },
  calendarDayCompleted: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  calendarDayPartial: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  calendarDayToday: {
    backgroundColor: "#000000",
  },
  calendarDayNotScheduled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  calendarDayText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "300",
  },
  calendarDayTextCompleted: {
    color: "#111827",
    fontWeight: "500",
  },
  calendarDayTextPartial: {
    color: "#374151",
    fontWeight: "400",
  },
  calendarDayTextToday: {
    color: "#ffffff",
    fontWeight: "500",
  },
  calendarDayTextNotScheduled: {
    color: "#9ca3af",
    fontWeight: "300",
  },
  scheduleSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendDotEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  legendDotPartial: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  legendDotCompleted: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  legendDotToday: {
    backgroundColor: "#000000",
  },
  legendDotNotScheduled: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "300",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "300",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "300",
    textAlign: "center",
  },
});

export default HabitHistoryScreen;

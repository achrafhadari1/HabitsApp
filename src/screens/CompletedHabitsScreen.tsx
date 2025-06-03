import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";
import { RootStackParamList } from "../types";
import { format, isToday, isYesterday, startOfDay } from "date-fns";

type CompletedHabitsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CompletedHabits"
>;

const CompletedHabitsScreen: React.FC = () => {
  const navigation = useNavigation<CompletedHabitsNavigationProp>();
  const { habits } = useHabits();

  // Get all completed habits grouped by date
  const completedHabits = useMemo(() => {
    const completed: { [date: string]: Array<{ habit: any; entry: any }> } = {};

    habits.forEach((habit) => {
      if (habit.entries && Array.isArray(habit.entries)) {
        habit.entries.forEach((entry) => {
          if (entry.completed) {
            const dateKey = format(entry.date, "yyyy-MM-dd");
            if (!completed[dateKey]) {
              completed[dateKey] = [];
            }
            completed[dateKey].push({ habit, entry });
          }
        });
      }
    });

    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(completed).sort((a, b) =>
      b.localeCompare(a)
    );

    return sortedDates.map((dateKey) => ({
      date: new Date(dateKey),
      dateKey,
      habits: completed[dateKey].sort((a, b) =>
        a.habit.name.localeCompare(b.habit.name)
      ),
    }));
  }, [habits]);

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  const getHabitIcon = (habitName: string) => {
    const name = habitName.toLowerCase();
    if (name.includes("water")) return "water-outline";
    if (
      name.includes("exercise") ||
      name.includes("workout") ||
      name.includes("gym")
    )
      return "fitness-outline";
    if (name.includes("read")) return "book-outline";
    if (name.includes("meditat")) return "leaf-outline";
    if (name.includes("sleep")) return "moon-outline";
    if (name.includes("walk") || name.includes("run")) return "walk-outline";
    if (name.includes("yoga")) return "body-outline";
    return "checkmark-circle-outline";
  };

  const formatHabitValue = (habit: any, entry: any) => {
    if (habit.trackingType === "completion") {
      return "Completed";
    }

    let unit = "";
    if (habit.trackingType === "duration") unit = "min";
    else if (habit.trackingType === "distance") unit = "km";
    else if (habit.trackingType === "quantity") {
      if (habit.name.toLowerCase().includes("water")) unit = "glasses";
      else if (habit.name.toLowerCase().includes("page")) unit = "pages";
      else unit = "times";
    }

    return `${entry.value} ${unit}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Completed Habits</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {completedHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>No Completed Habits</Text>
            <Text style={styles.emptySubtitle}>
              Start completing your habits to see them here!
            </Text>
          </View>
        ) : (
          completedHabits.map(({ date, dateKey, habits: dayHabits }) => (
            <View key={dateKey} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatDateHeader(date)}</Text>
              <Text style={styles.dateSubheader}>
                {format(date, "MMMM d, yyyy")}
              </Text>

              <View style={styles.habitsContainer}>
                {dayHabits.map(({ habit, entry }, index) => (
                  <TouchableOpacity
                    key={`${habit.id}-${entry.date}`}
                    style={styles.habitCard}
                    onPress={() =>
                      navigation.navigate("HabitDetail", { habitId: habit.id })
                    }
                  >
                    <View style={styles.habitIcon}>
                      <Ionicons
                        name={getHabitIcon(habit.name)}
                        size={20}
                        color="#6b7280"
                      />
                    </View>

                    <View style={styles.habitInfo}>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <Text style={styles.habitValue}>
                        {formatHabitValue(habit, entry)}
                      </Text>
                    </View>

                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-outline"
                        size={16}
                        color="#6b7280"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  dateSection: {
    marginBottom: 32,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  dateSubheader: {
    fontSize: 14,
    color: "#6b7280",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  habitsContainer: {
    paddingHorizontal: 20,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  habitValue: {
    fontSize: 14,
    color: "#6b7280",
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CompletedHabitsScreen;

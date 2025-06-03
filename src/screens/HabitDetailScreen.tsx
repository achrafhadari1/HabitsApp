import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  subDays,
} from "date-fns";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getCurrentDateString,
  getDateString,
  shouldTrackHabitOnDate,
  getHabitProgressText,
  getScheduleDisplayText,
  isHabitCompletedForPeriod,
} from "../utils/scheduleUtils";

type HabitDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HabitDetail"
>;
type HabitDetailRouteProp = RouteProp<RootStackParamList, "HabitDetail">;

const HabitDetailScreen: React.FC = () => {
  const navigation = useNavigation<HabitDetailNavigationProp>();
  const route = useRoute<HabitDetailRouteProp>();
  const { habitId } = route.params;
  const { getHabitById, updateHabitEntry, completeHabit } = useHabits();

  const habit = getHabitById(habitId);
  const today = getCurrentDateString();
  const todayDate = new Date();
  const currentValue = habit?.entries[today] || 0;
  const canTrackToday = habit
    ? shouldTrackHabitOnDate(habit, todayDate)
    : false;
  const progressText = habit ? getHabitProgressText(habit, todayDate) : "";
  const scheduleText = habit ? getScheduleDisplayText(habit) : "";

  // Custom input modal state
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Generate calendar data for the last 35 days (5 weeks)
  const calendarData = useMemo(() => {
    if (!habit) return [];

    const endDate = new Date();
    const startDate = subDays(endDate, 34); // 35 days total
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((date) => {
      const dateStr = getDateString(date);
      const isToday = isSameDay(date, todayDate);
      const isScheduled = shouldTrackHabitOnDate(habit, date);
      const isCompleted = isScheduled && isHabitCompletedForPeriod(habit, date);
      const dayNumber = date.getDate();

      return {
        date,
        dateStr,
        dayNumber,
        isToday,
        isScheduled,
        isCompleted,
      };
    });
  }, [habit, todayDate]);

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Habit not found</Text>
      </SafeAreaView>
    );
  }

  const handleIncrement = () => {
    if (!canTrackToday) {
      alert(`This habit is not scheduled for today. Schedule: ${scheduleText}`);
      return;
    }

    // For increment type, allow going beyond target if flexible
    const maxValue = habit.isTargetFlexible ? Infinity : habit.target;
    if (currentValue < maxValue) {
      updateHabitEntry(habit.id, today, currentValue + 1);
    }
  };

  const handleDecrement = () => {
    if (!canTrackToday) {
      alert(`This habit is not scheduled for today. Schedule: ${scheduleText}`);
      return;
    }
    if (currentValue > 0) {
      updateHabitEntry(habit.id, today, currentValue - 1);
    }
  };

  const handleQuickComplete = () => {
    if (!canTrackToday) {
      alert(`This habit is not scheduled for today. Schedule: ${scheduleText}`);
      return;
    }
    completeHabit(habit.id, today);
  };

  const handleQuickValue = (value: number) => {
    if (!canTrackToday) {
      alert(`This habit is not scheduled for today. Schedule: ${scheduleText}`);
      return;
    }

    if (habit.trackingType === "increment") {
      // For increment, add to current value
      updateHabitEntry(habit.id, today, currentValue + value);
    } else {
      // For other types, set the value
      updateHabitEntry(habit.id, today, value);
    }
  };

  const handleCustomInput = () => {
    setCustomValue(currentValue.toString());
    setShowCustomInput(true);
  };

  const handleCustomSubmit = () => {
    if (!canTrackToday) {
      alert(`This habit is not scheduled for today. Schedule: ${scheduleText}`);
      return;
    }

    const value = parseFloat(customValue);
    if (isNaN(value) || value < 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }

    updateHabitEntry(habit.id, today, value);
    setShowCustomInput(false);
    setCustomValue("");
  };

  const isWater = habit.name.toLowerCase().includes("water");

  return (
    <SafeAreaView style={[styles.container, isWater && styles.waterContainer]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isWater ? "#DDEDEC" : "#ffffff"}
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

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Tracking Section */}
        <View style={styles.trackingSection}>
          {/* Progress Display */}
          <View style={styles.progressDisplay}>
            <Text style={styles.progressNumber}>{currentValue}</Text>
            <Text style={styles.progressTarget}>{progressText}</Text>
            {!canTrackToday && (
              <Text style={styles.scheduleInfo}>{scheduleText}</Text>
            )}
          </View>

          {/* Quick Actions based on tracking type */}
          {habit.trackingType === "completion" && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                onPress={handleQuickComplete}
                style={[
                  styles.completeButton,
                  currentValue >= habit.target && styles.completedButton,
                  !canTrackToday && styles.disabledButton,
                ]}
                disabled={!canTrackToday}
              >
                <Ionicons
                  name={
                    currentValue >= habit.target
                      ? "checkmark-circle"
                      : "checkmark-circle-outline"
                  }
                  size={24}
                  color={
                    !canTrackToday
                      ? "#d1d5db"
                      : currentValue >= habit.target
                      ? "#10b981"
                      : "#ffffff"
                  }
                />
                <Text
                  style={[
                    styles.completeButtonText,
                    currentValue >= habit.target && styles.completedButtonText,
                    !canTrackToday && styles.disabledButtonText,
                  ]}
                >
                  {currentValue >= habit.target ? "Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {(habit.trackingType === "increment" ||
            habit.trackingType === "quantity" ||
            habit.trackingType === "duration") && (
            <>
              {/* Quick Value Buttons */}
              {habit.quickValues && habit.quickValues.length > 0 && (
                <View style={styles.quickActions}>
                  <Text style={styles.quickActionsLabel}>Quick Add:</Text>
                  <View style={styles.quickValueButtons}>
                    {habit.quickValues.map((value, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleQuickValue(value)}
                        style={[
                          styles.quickValueButton,
                          !canTrackToday && styles.disabledButton,
                        ]}
                        disabled={!canTrackToday}
                      >
                        <Text
                          style={[
                            styles.quickValueText,
                            !canTrackToday && styles.disabledButtonText,
                          ]}
                        >
                          +{value} {habit.unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Traditional Counter */}
              <View style={styles.counterSection}>
                <TouchableOpacity
                  onPress={handleDecrement}
                  style={[
                    styles.counterButton,
                    !canTrackToday && styles.disabledButton,
                  ]}
                  disabled={currentValue <= 0 || !canTrackToday}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={
                      currentValue <= 0 || !canTrackToday
                        ? "#d1d5db"
                        : "#374151"
                    }
                  />
                </TouchableOpacity>

                <View style={styles.counterDisplay}>
                  <Text style={styles.counterLabel}>Manual Adjust</Text>
                </View>

                <TouchableOpacity
                  onPress={handleIncrement}
                  style={[
                    styles.counterButton,
                    styles.incrementButton,
                    !canTrackToday && styles.disabledButton,
                  ]}
                  disabled={
                    (!habit.isTargetFlexible && currentValue >= habit.target) ||
                    !canTrackToday
                  }
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={
                      (!habit.isTargetFlexible &&
                        currentValue >= habit.target) ||
                      !canTrackToday
                        ? "#d1d5db"
                        : "#ffffff"
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Custom Input Button */}
              <TouchableOpacity
                onPress={handleCustomInput}
                style={[
                  styles.customInputButton,
                  !canTrackToday && styles.disabledButton,
                ]}
                disabled={!canTrackToday}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={!canTrackToday ? "#d1d5db" : "#374151"}
                />
                <Text
                  style={[
                    styles.customInputText,
                    !canTrackToday && styles.disabledButtonText,
                  ]}
                >
                  Enter Custom Value
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyLabel}>habit</Text>
            <Text style={styles.historyTitle}>history</Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("HabitHistory", { habitId: habit.id })
            }
            style={styles.historyButton}
          >
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Calendar Preview */}
        <View style={styles.calendarPreview}>
          <View style={styles.calendarGrid}>
            {calendarData.map((dayData, index) => (
              <View
                key={dayData.dateStr}
                style={[
                  styles.calendarDay,
                  dayData.isCompleted && styles.calendarDayCompleted,
                  dayData.isToday && styles.calendarDayToday,
                  !dayData.isScheduled && styles.calendarDayNotScheduled,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    dayData.isCompleted && styles.calendarDayTextCompleted,
                    dayData.isToday && styles.calendarDayTextToday,
                    !dayData.isScheduled && styles.calendarDayTextNotScheduled,
                  ]}
                >
                  {dayData.dayNumber}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Custom Input Modal */}
      <Modal
        visible={showCustomInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Enter {habit?.unit || "value"}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={customValue}
              onChangeText={setCustomValue}
              placeholder={`Enter ${habit?.unit || "value"}`}
              keyboardType="numeric"
              autoFocus={true}
              selectTextOnFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowCustomInput(false)}
                style={[styles.modalButton, styles.modalCancelButton]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCustomSubmit}
                style={[styles.modalButton, styles.modalSubmitButton]}
              >
                <Text style={styles.modalSubmitText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flex: 1,
  },
  waterContainer: {
    backgroundColor: "#DDEDEC",
  },
  statusBarSpacer: {
    height: 40, // Extra space below status bar
  },
  bottomSpacer: {
    height: 30, // Space at bottom for completed tasks
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
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
  trackingSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  progressDisplay: {
    alignItems: "center",
    marginBottom: 30,
  },
  progressNumber: {
    fontSize: 100,
    fontWeight: "100",
    color: "#111827",
    lineHeight: 110,
    textAlign: "center",
    includeFontPadding: false,
  },
  progressTarget: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "300",
    marginTop: 8,
  },
  quickActions: {
    marginBottom: 20,
  },
  quickActionsLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  quickValueButtons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  quickValueButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  quickValueText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
  },
  completedButton: {
    backgroundColor: "#10b981",
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  completedButtonText: {
    color: "#ffffff",
  },
  counterSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  incrementButton: {
    backgroundColor: "#000000",
  },
  counterDisplay: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 40,
  },
  counterLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "400",
  },
  counterNumber: {
    fontSize: 100,
    fontWeight: "100",
    color: "#111827",
    lineHeight: 110,
    textAlign: "center",
    includeFontPadding: false,
  },
  counterTarget: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "300",
    marginTop: 8,
  },
  historySection: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  historyHeader: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "300",
  },
  historyTitle: {
    fontSize: 24,
    color: "#111827",
    fontWeight: "300",
    marginTop: 2,
  },
  historyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarPreview: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    marginBottom: 6,
    borderRadius: 16,
  },
  calendarDayCompleted: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  calendarDayToday: {
    backgroundColor: "#000000",
  },
  calendarDayText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "300",
  },
  calendarDayTextCompleted: {
    color: "#111827",
    fontWeight: "400",
  },
  calendarDayTextToday: {
    color: "#ffffff",
    fontWeight: "500",
  },
  calendarDayNotScheduled: {
    backgroundColor: "transparent",
    opacity: 0.3,
  },
  calendarDayTextNotScheduled: {
    color: "#d1d5db",
    fontWeight: "300",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#d1d5db",
  },
  scheduleInfo: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "300",
    marginTop: 4,
    textAlign: "center",
  },
  customInputButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBEBCC",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  customInputText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  modalCancelButton: {
    backgroundColor: "#DDEDEC",
  },
  modalSubmitButton: {
    backgroundColor: "#374151",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    textAlign: "center",
  },
});

export default HabitDetailScreen;

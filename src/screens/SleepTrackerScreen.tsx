import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, subDays, addDays, parseISO } from "date-fns";
import { useHabits } from "../context/HabitsContext";

const SleepTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { sleepData, addSleepEntry, getSleepStats } = useHabits();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hours, setHours] = useState("7.5");
  const [quality, setQuality] = useState(3);
  const [isAdding, setIsAdding] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const selectedEntry = sleepData.find((entry) => entry.date === formattedDate);
  const stats = getSleepStats();

  // Get the last 7 days of sleep data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = sleepData.find((entry) => entry.date === dateStr);

    return {
      date: dateStr,
      displayDate: format(date, "EEE"),
      hours: entry ? entry.hours : 0,
      score: entry ? entry.score : 0,
      hasData: !!entry,
    };
  }).reverse();

  const handleSave = () => {
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum < 0 || hoursNum > 24) {
      Alert.alert("Error", "Please enter valid hours (0-24)");
      return;
    }

    addSleepEntry(formattedDate, hoursNum, quality * 25); // Convert 1-5 scale to 0-100
    setIsAdding(false);
    Alert.alert("Success", "Sleep entry saved!");
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = sleepData.find((entry) => entry.date === dateStr);
    if (entry) {
      setHours(entry.hours.toString());
      setQuality(Math.round(entry.score / 25));
    } else {
      setHours("7.5");
      setQuality(3);
    }
  };

  const startAdding = () => {
    setSelectedDate(new Date());
    const today = format(new Date(), "yyyy-MM-dd");
    const entry = sleepData.find((entry) => entry.date === today);
    if (entry) {
      setHours(entry.hours.toString());
      setQuality(Math.round(entry.score / 25));
    } else {
      setHours("7.5");
      setQuality(3);
    }
    setIsAdding(true);
  };

  if (isAdding) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsAdding(false)}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Sleep</Text>
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              onPress={() => handleSelectDate(subDays(selectedDate, 1))}
              style={styles.dateButton}
            >
              <Ionicons name="chevron-back" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{format(selectedDate, "MMM d")}</Text>
            <TouchableOpacity
              onPress={() => handleSelectDate(addDays(selectedDate, 1))}
              style={styles.dateButton}
              disabled={
                format(addDays(selectedDate, 1), "yyyy-MM-dd") >
                format(new Date(), "yyyy-MM-dd")
              }
            >
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Hours slept</Text>
            <TextInput
              value={hours}
              onChangeText={setHours}
              placeholder="7.5"
              keyboardType="decimal-pad"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Sleep quality</Text>
            <View style={styles.qualityButtons}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setQuality(value)}
                  style={[
                    styles.qualityButton,
                    quality === value && styles.qualityButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      quality === value && styles.qualityButtonTextSelected,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.qualityHint}>1 = Poor, 5 = Excellent</Text>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setIsAdding(false)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Tracker</Text>
        <TouchableOpacity onPress={startAdding} style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Overview Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Sleep Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Average Sleep</Text>
              <Text style={styles.statValue}>{stats.avgHours} hrs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Quality Score</Text>
              <Text style={styles.statValue}>
                {sleepData.length ? stats.avgScore + "%" : "No data"}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent History Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {last7Days.map((day, index) => (
                <View key={day.date} style={styles.chartDay}>
                  <View style={styles.chartBar}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: day.hasData
                            ? `${(day.hours / 12) * 100}%`
                            : "0%",
                          backgroundColor: day.hasData ? "#3b82f6" : "#e5e7eb",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{day.displayDate}</Text>
                  {day.hasData && (
                    <Text style={styles.chartHours}>{day.hours}h</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sleep Log */}
        <View style={styles.logSection}>
          <Text style={styles.sectionTitle}>Sleep Log</Text>
          {sleepData.length > 0 ? (
            sleepData
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 10)
              .map((entry) => (
                <View key={entry.date} style={styles.logEntry}>
                  <View style={styles.logEntryLeft}>
                    <Text style={styles.logDate}>
                      {format(parseISO(entry.date), "EEE, MMM d")}
                    </Text>
                    <View style={styles.logDetails}>
                      <Ionicons name="moon" size={16} color="#6366f1" />
                      <Text style={styles.logHours}>{entry.hours} hours</Text>
                    </View>
                  </View>
                  <View style={styles.logEntryRight}>
                    <Text style={styles.logQualityLabel}>Quality</Text>
                    <Text style={styles.logQuality}>{entry.score}%</Text>
                  </View>
                </View>
              ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="moon-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No sleep data recorded yet
              </Text>
              <TouchableOpacity
                onPress={startAdding}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>
                  Track Your Sleep
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "300",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "300",
    minWidth: 50,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f0f4f4",
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "300",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "300",
    marginTop: 4,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: "#f0f4f4",
    padding: 16,
    borderRadius: 12,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartDay: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 20,
    height: 80,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarFill: {
    width: "100%",
    borderRadius: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontWeight: "300",
  },
  chartHours: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    fontWeight: "300",
  },
  logSection: {
    marginBottom: 24,
  },
  logEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 8,
  },
  logEntryLeft: {
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    color: "#666",
    fontWeight: "300",
  },
  logDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  logHours: {
    fontSize: 16,
    fontWeight: "300",
    marginLeft: 4,
  },
  logEntryRight: {
    alignItems: "flex-end",
  },
  logQualityLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "300",
  },
  logQuality: {
    fontSize: 16,
    fontWeight: "300",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    fontWeight: "300",
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "300",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: "300",
    backgroundColor: "#fff",
  },
  qualityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  qualityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  qualityButtonSelected: {
    backgroundColor: "#000",
  },
  qualityButtonText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#666",
  },
  qualityButtonTextSelected: {
    color: "#fff",
  },
  qualityHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontWeight: "300",
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#000",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#fff",
  },
});

export default SleepTrackerScreen;

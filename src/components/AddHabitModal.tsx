import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";

const ICON_OPTIONS = [
  { name: "Droplets", icon: "water" },
  { name: "Dumbbell", icon: "barbell" },
  { name: "StretchHorizontal", icon: "body" },
  { name: "BookOpen", icon: "book" },
  { name: "Moon", icon: "moon" },
  { name: "Apple", icon: "nutrition" },
  { name: "Coffee", icon: "cafe" },
  { name: "Move", icon: "walk" },
  { name: "Brain", icon: "bulb" },
  { name: "Pill", icon: "medical" },
  { name: "Activity", icon: "pulse" },
  { name: "ShowerHead", icon: "water" },
  { name: "Ban", icon: "ban" },
];

const HABIT_TEMPLATES = [
  { name: "Water", icon: "Droplets", target: 10, unit: "glasses" },
  { name: "Yoga", icon: "StretchHorizontal", target: 30, unit: "min" },
  { name: "No cigarettes", icon: "Ban", target: 21, unit: "days" },
  { name: "Morning exercises", icon: "Dumbbell", target: 15, unit: "min" },
];

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose }) => {
  const { addHabit } = useHabits();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Droplets");
  const [target, setTarget] = useState("1");
  const [unit, setUnit] = useState("times");
  const [scheduleType, setScheduleType] = useState<
    "daily" | "weekly" | "custom"
  >("daily");
  const [frequency, setFrequency] = useState("2");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3]); // Monday, Wednesday by default

  const handleTemplateSelect = (template: (typeof HABIT_TEMPLATES)[0]) => {
    setName(template.name);
    setIcon(template.icon);
    setTarget(template.target.toString());
    setUnit(template.unit);
  };

  const handleSubmit = () => {
    if (!name.trim() || parseInt(target) <= 0) {
      Alert.alert("Error", "Please enter a valid habit name and target.");
      return;
    }

    const newHabit: any = {
      name: name.trim(),
      icon,
      target: parseInt(target),
      unit: unit.trim() || "times",
    };

    // Add schedule if not daily
    if (scheduleType !== "daily") {
      newHabit.schedule = {
        type: scheduleType,
        frequency: scheduleType === "weekly" ? parseInt(frequency) : undefined,
        days: scheduleType === "custom" ? selectedDays : undefined,
      };
    }

    addHabit(newHabit);

    // Reset form
    setName("");
    setIcon("Droplets");
    setTarget("1");
    setUnit("times");
    setScheduleType("daily");
    setFrequency("2");
    setSelectedDays([1, 3]);

    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Habit</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Templates</Text>
            <View style={styles.templatesGrid}>
              {HABIT_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.name}
                  onPress={() => handleTemplateSelect(template)}
                  style={styles.templateButton}
                >
                  <Ionicons
                    name={
                      (ICON_OPTIONS.find((opt) => opt.name === template.icon)
                        ?.icon as any) || "water"
                    }
                    size={18}
                    color="#666"
                  />
                  <Text style={styles.templateText}>{template.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Icon</Text>
            <View style={styles.iconsGrid}>
              {ICON_OPTIONS.map((iconOption) => (
                <TouchableOpacity
                  key={iconOption.name}
                  onPress={() => setIcon(iconOption.name)}
                  style={[
                    styles.iconButton,
                    icon === iconOption.name && styles.iconButtonSelected,
                  ]}
                >
                  <Ionicons
                    name={iconOption.icon as any}
                    size={20}
                    color={icon === iconOption.name ? "#fff" : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Habit Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Drink Water"
              style={styles.textInput}
            />
          </View>

          {/* Target and Unit */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.sectionTitle}>Target</Text>
                <TextInput
                  value={target}
                  onChangeText={setTarget}
                  placeholder="1"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.sectionTitle}>Unit</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="times"
                  style={styles.textInput}
                />
              </View>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.scheduleButtons}>
              {["daily", "weekly", "custom"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setScheduleType(type as any)}
                  style={[
                    styles.scheduleButton,
                    scheduleType === type && styles.scheduleButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.scheduleButtonText,
                      scheduleType === type &&
                        styles.scheduleButtonTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {scheduleType === "weekly" && (
              <View style={styles.frequencySection}>
                <Text style={styles.sectionTitle}>Times per week</Text>
                <TextInput
                  value={frequency}
                  onChangeText={setFrequency}
                  placeholder="2"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            )}

            {scheduleType === "custom" && (
              <View style={styles.daysSection}>
                <Text style={styles.sectionTitle}>Select days</Text>
                <View style={styles.daysGrid}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <TouchableOpacity
                      key={day + index}
                      onPress={() => toggleDay(index)}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(index) &&
                          styles.dayButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          selectedDays.includes(index) &&
                            styles.dayButtonTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "300",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
    marginBottom: 8,
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    width: "48%",
  },
  templateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "300",
  },
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonSelected: {
    backgroundColor: "#000",
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
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  scheduleButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  scheduleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  scheduleButtonSelected: {
    backgroundColor: "#000",
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
  },
  scheduleButtonTextSelected: {
    color: "#fff",
  },
  frequencySection: {
    marginTop: 16,
  },
  daysSection: {
    marginTop: 16,
  },
  daysGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  dayButtonSelected: {
    backgroundColor: "#000",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
  },
  dayButtonTextSelected: {
    color: "#fff",
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
  createButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#000",
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#fff",
  },
});

export default AddHabitModal;

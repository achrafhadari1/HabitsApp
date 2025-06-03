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
import { createHabitSchedule } from "../utils/scheduleUtils";
import {
  HABIT_TEMPLATES,
  HABIT_CATEGORIES,
  getHabitsByCategory,
  getTrackingTypeDescription,
} from "../utils/habitTemplates";
import { HabitTrackingType } from "../types";

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose }) => {
  const { addHabit } = useHabits();

  // State for habit creation
  const [step, setStep] = useState<"template" | "custom" | "details">(
    "template"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("water");
  const [target, setTarget] = useState("1");
  const [unit, setUnit] = useState("times");
  const [trackingType, setTrackingType] =
    useState<HabitTrackingType>("increment");
  const [isTargetFlexible, setIsTargetFlexible] = useState(false);
  const [quickValues, setQuickValues] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<
    "daily" | "weekly" | "custom"
  >("daily");
  const [frequency, setFrequency] = useState("2");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3]); // Monday, Wednesday by default

  const resetForm = () => {
    setStep("template");
    setSelectedCategory("");
    setSelectedTemplate(null);
    setName("");
    setIcon("water");
    setTarget("1");
    setUnit("times");
    setTrackingType("increment");
    setIsTargetFlexible(false);
    setQuickValues("");
    setScheduleType("daily");
    setFrequency("2");
    setSelectedDays([1, 3]);
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setName(template.name);
    setIcon(template.icon);
    setTarget(template.target.toString());
    setUnit(template.unit);
    setTrackingType(template.trackingType);
    setIsTargetFlexible(template.isTargetFlexible || false);
    setQuickValues(template.quickValues ? template.quickValues.join(", ") : "");
    setStep("details");
  };

  const handleCustomHabit = () => {
    setStep("custom");
  };

  const handleSubmit = () => {
    if (!name.trim() || parseInt(target) <= 0) {
      Alert.alert("Error", "Please enter a valid habit name and target.");
      return;
    }

    // Validate schedule
    if (
      scheduleType === "weekly" &&
      (parseInt(frequency) <= 0 || parseInt(frequency) > 7)
    ) {
      Alert.alert("Error", "Weekly frequency must be between 1 and 7 days.");
      return;
    }

    if (scheduleType === "custom" && selectedDays.length === 0) {
      Alert.alert(
        "Error",
        "Please select at least one day for custom schedule."
      );
      return;
    }

    const newHabit: any = {
      name: name.trim(),
      icon,
      target: parseInt(target),
      unit: unit.trim() || "times",
      trackingType,
      isTargetFlexible,
    };

    // Add quick values if provided
    if (quickValues.trim()) {
      const values = quickValues
        .split(",")
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v));
      if (values.length > 0) {
        newHabit.quickValues = values;
      }
    }

    // Create schedule using utility function
    newHabit.schedule = createHabitSchedule(
      scheduleType,
      scheduleType === "weekly" ? parseInt(frequency) : undefined,
      scheduleType === "custom" ? selectedDays : undefined
    );

    addHabit(newHabit);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const renderTemplateStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose a Habit Template</Text>

      <ScrollView style={styles.categoriesContainer}>
        {HABIT_CATEGORIES.map((category) => (
          <View key={category} style={styles.categorySection}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === category ? "" : category
                )
              }
            >
              <Text style={styles.categoryTitle}>{category}</Text>
              <Ionicons
                name={
                  selectedCategory === category
                    ? "chevron-down"
                    : "chevron-forward"
                }
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {selectedCategory === category && (
              <View style={styles.templatesGrid}>
                {getHabitsByCategory(category).map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateCard}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <Ionicons
                      name={template.icon as any}
                      size={24}
                      color="#374151"
                    />
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDetails}>
                      {template.target} {template.unit}
                    </Text>
                    <Text style={styles.templateType}>
                      {getTrackingTypeDescription(template.trackingType)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.customButton} onPress={handleCustomHabit}>
        <Ionicons name="add-outline" size={24} color="#374151" />
        <Text style={styles.customButtonText}>Create Custom Habit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCustomStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Custom Habit</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter habit name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tracking Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trackingTypes}
        >
          {(
            [
              "increment",
              "completion",
              "duration",
              "quantity",
            ] as HabitTrackingType[]
          ).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.trackingTypeButton,
                trackingType === type && styles.trackingTypeButtonActive,
              ]}
              onPress={() => setTrackingType(type)}
            >
              <Text
                style={[
                  styles.trackingTypeText,
                  trackingType === type && styles.trackingTypeTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.trackingTypeDescription}>
          {getTrackingTypeDescription(trackingType)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Target</Text>
          <TextInput
            style={styles.input}
            value={target}
            onChangeText={setTarget}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            value={unit}
            onChangeText={setUnit}
            placeholder="times"
          />
        </View>
      </View>

      {(trackingType === "duration" || trackingType === "quantity") && (
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsTargetFlexible(!isTargetFlexible)}
          >
            <Ionicons
              name={isTargetFlexible ? "checkbox" : "square-outline"}
              size={24}
              color="#374151"
            />
            <Text style={styles.checkboxLabel}>Allow exceeding target</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quick Values (optional)</Text>
        <TextInput
          style={styles.input}
          value={quickValues}
          onChangeText={setQuickValues}
          placeholder="e.g., 250, 500, 1000"
        />
        <Text style={styles.inputHint}>
          Comma-separated values for quick entry
        </Text>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep("details")}
      >
        <Text style={styles.nextButtonText}>Next: Schedule</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Schedule & Details</Text>

      {selectedTemplate && (
        <View style={styles.selectedTemplate}>
          <Ionicons
            name={selectedTemplate.icon as any}
            size={32}
            color="#374151"
          />
          <View style={styles.selectedTemplateInfo}>
            <Text style={styles.selectedTemplateName}>{name}</Text>
            <Text style={styles.selectedTemplateDetails}>
              {target} {unit} • {getTrackingTypeDescription(trackingType)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Schedule Type</Text>
        <View style={styles.scheduleButtons}>
          {[
            { key: "daily", label: "Daily" },
            { key: "weekly", label: "Weekly" },
            { key: "custom", label: "Custom" },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.scheduleButton,
                scheduleType === key && styles.scheduleButtonActive,
              ]}
              onPress={() => setScheduleType(key as any)}
            >
              <Text
                style={[
                  styles.scheduleButtonText,
                  scheduleType === key && styles.scheduleButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {scheduleType === "weekly" && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Times per week</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="2"
            keyboardType="numeric"
          />
        </View>
      )}

      {scheduleType === "custom" && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Days</Text>
          <View style={styles.daysContainer}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(index) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(index) &&
                        styles.dayButtonTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
        <Text style={styles.createButtonText}>Create Habit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Habit</Text>
          {step !== "template" && (
            <TouchableOpacity
              onPress={() =>
                setStep(
                  step === "details"
                    ? selectedTemplate
                      ? "template"
                      : "custom"
                    : "template"
                )
              }
            >
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {step === "template" && renderTemplateStep()}
          {step === "custom" && renderCustomStep()}
          {step === "details" && renderDetailsStep()}
        </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    color: "#374151",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  categoriesContainer: {
    maxHeight: 400,
  },
  categorySection: {
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  templateCard: {
    width: "48%",
    margin: "1%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  templateName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  templateDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  templateType: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    textAlign: "center",
  },
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  customButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  trackingTypes: {
    marginBottom: 10,
  },
  trackingTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  trackingTypeButtonActive: {
    backgroundColor: "#374151",
  },
  trackingTypeText: {
    color: "#666",
    fontSize: 14,
  },
  trackingTypeTextActive: {
    color: "#fff",
  },
  trackingTypeDescription: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: "#374151",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedTemplate: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedTemplateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  selectedTemplateName: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectedTemplateDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  scheduleButtons: {
    flexDirection: "row",
    marginBottom: 10,
  },
  scheduleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  scheduleButtonActive: {
    backgroundColor: "#374151",
    borderColor: "#374151",
  },
  scheduleButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  scheduleButtonTextActive: {
    color: "#fff",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonActive: {
    backgroundColor: "#374151",
    borderColor: "#374151",
  },
  dayButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#374151",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddHabitModal;

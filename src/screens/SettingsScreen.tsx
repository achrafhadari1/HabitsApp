import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../context/HabitsContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type SettingsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const {
    userProfile,
    settings,
    updateUserProfile,
    updateSettings,
    clearAllData,
  } = useHabits();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileTimezone, setProfileTimezone] = useState(userProfile.timezone);

  const handleSaveProfile = () => {
    updateUserProfile({
      name: profileName.trim(),
      timezone: profileTimezone.trim(),
    });
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setProfileName(userProfile.name);
    setProfileTimezone(userProfile.timezone);
    setIsEditingProfile(false);
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your habits, progress, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearAllData();
            Alert.alert("Success", "All data has been cleared.");
          },
        },
      ]
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
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileDetails}>
                  Member since{" "}
                  {new Date(userProfile.joinDate).toLocaleDateString()}
                </Text>
                <Text style={styles.profileDetails}>
                  Timezone: {userProfile.timezone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingProfile(true)}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {isEditingProfile && (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={profileName}
                    onChangeText={setProfileName}
                    placeholder="Enter your name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Timezone</Text>
                  <TextInput
                    style={styles.input}
                    value={profileTimezone}
                    onChangeText={setProfileTimezone}
                    placeholder="e.g., America/New_York"
                  />
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={handleCancelProfile}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive habit reminders
              </Text>
            </View>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={(value) =>
                updateSettings({
                  notifications: { ...settings.notifications, enabled: value },
                })
              }
              trackColor={{ false: "#e5e7eb", true: "#374151" }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingDescription}>App appearance</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  theme: settings.theme === "light" ? "dark" : "light",
                })
              }
              style={styles.themeButton}
            >
              <Text style={styles.themeButtonText}>
                {settings.theme === "light" ? "Light" : "Dark"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Week Starts On</Text>
              <Text style={styles.settingDescription}>
                First day of the week
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  weekStartsOn: settings.weekStartsOn === 0 ? 1 : 0,
                })
              }
              style={styles.themeButton}
            >
              <Text style={styles.themeButtonText}>
                {settings.weekStartsOn === 0 ? "Sunday" : "Monday"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Units</Text>
              <Text style={styles.settingDescription}>Measurement system</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  units: settings.units === "metric" ? "imperial" : "metric",
                })
              }
              style={styles.themeButton}
            >
              <Text style={styles.themeButtonText}>
                {settings.units === "metric" ? "Metric" : "Imperial"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            onPress={handleClearAllData}
            style={styles.dangerButton}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </View>

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
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
  },
  editForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#374151",
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  themeButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ef4444",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  infoValue: {
    fontSize: 14,
    color: "#6b7280",
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SettingsScreen;

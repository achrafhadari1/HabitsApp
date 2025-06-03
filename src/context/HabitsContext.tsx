import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import {
  Habit,
  MemorableMoment,
  SleepEntry,
  WeightEntry,
  HabitsContextType,
  UserProfile,
  AppSettings,
} from "../types";
import {
  getCurrentDateString,
  getDateString,
  shouldTrackHabitOnDate,
  isHabitCompletedForPeriod,
  getHabitStreak,
} from "../utils/scheduleUtils";

// Default user profile and settings
const defaultProfile: UserProfile = {
  name: "Martin Kenter",
  joinDate: format(new Date(), "yyyy-MM-dd"),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const defaultSettings: AppSettings = {
  notifications: {
    enabled: true,
    reminderTime: "09:00",
    soundEnabled: true,
  },
  theme: "light",
  weekStartsOn: 1, // Monday
  units: {
    weight: "kg",
    distance: "km",
  },
};

// Context creation
const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [memorableMoments, setMemorableMoments] = useState<MemorableMoment[]>(
    []
  );
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedHabits = await AsyncStorage.getItem("habits");
        const savedMoments = await AsyncStorage.getItem("memorableMoments");
        const savedSleep = await AsyncStorage.getItem("sleepData");
        const savedWeight = await AsyncStorage.getItem("weightData");
        const savedProfile = await AsyncStorage.getItem("userProfile");
        const savedSettings = await AsyncStorage.getItem("appSettings");

        if (savedHabits) {
          const parsedHabits = JSON.parse(savedHabits);
          setHabits(parsedHabits);
        } else {
          setHabits([]);
        }

        if (savedMoments) setMemorableMoments(JSON.parse(savedMoments));
        if (savedSleep) setSleepData(JSON.parse(savedSleep));
        if (savedWeight) setWeightData(JSON.parse(savedWeight));
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading data:", error);
        setHabits([]);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem("habits", JSON.stringify(habits));
      } catch (error) {
        console.error("Error saving habits:", error);
      }
    };
    saveHabits();
  }, [habits]);

  useEffect(() => {
    const saveMoments = async () => {
      try {
        await AsyncStorage.setItem(
          "memorableMoments",
          JSON.stringify(memorableMoments)
        );
      } catch (error) {
        console.error("Error saving moments:", error);
      }
    };
    if (memorableMoments.length > 0) saveMoments();
  }, [memorableMoments]);

  useEffect(() => {
    const saveSleep = async () => {
      try {
        await AsyncStorage.setItem("sleepData", JSON.stringify(sleepData));
      } catch (error) {
        console.error("Error saving sleep data:", error);
      }
    };
    if (sleepData.length > 0) saveSleep();
  }, [sleepData]);

  useEffect(() => {
    const saveWeight = async () => {
      try {
        await AsyncStorage.setItem("weightData", JSON.stringify(weightData));
      } catch (error) {
        console.error("Error saving weight data:", error);
      }
    };
    if (weightData.length > 0) saveWeight();
  }, [weightData]);

  const addHabit = (habit: Omit<Habit, "id" | "entries">) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      entries: {},
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (
    id: string,
    habitData: Omit<Habit, "id" | "entries">
  ) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          return {
            ...habit,
            ...habitData,
          };
        }
        return habit;
      })
    );
  };

  const updateHabitEntry = (id: string, date: string, value: number) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          // Check if the habit should be tracked on this date
          const dateObj = new Date(date);
          if (!shouldTrackHabitOnDate(habit, dateObj)) {
            console.warn(`Habit ${habit.name} is not scheduled for ${date}`);
            return habit; // Don't update if not scheduled
          }

          return {
            ...habit,
            entries: {
              ...habit.entries,
              [date]: Math.max(0, value), // Ensure non-negative values
            },
          };
        }
        return habit;
      })
    );
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const addMemorableMoment = (date: string, text: string) => {
    // First check if there's already a moment for this date
    const existingIndex = memorableMoments.findIndex(
      (moment) => moment.date === date
    );

    if (existingIndex >= 0) {
      // Update existing moment
      setMemorableMoments((prev) => {
        const updated = [...prev];
        updated[existingIndex] = { date, text };
        return updated;
      });
    } else {
      // Add new moment
      setMemorableMoments((prev) => [...prev, { date, text }]);
    }
  };

  const addSleepEntry = (date: string, hours: number, score: number) => {
    // Check if entry already exists for this date
    const existingIndex = sleepData.findIndex((entry) => entry.date === date);
    const timestamp = new Date().getTime();

    if (existingIndex >= 0) {
      setSleepData((prev) => {
        const updated = [...prev];
        updated[existingIndex] = { date, hours, score, timestamp };
        return updated;
      });
    } else {
      setSleepData((prev) => [...prev, { date, hours, score, timestamp }]);
    }
  };

  const addWeightEntry = (date: string, weight: number) => {
    // Check if entry already exists for this date
    const existingIndex = weightData.findIndex((entry) => entry.date === date);

    if (existingIndex >= 0) {
      setWeightData((prev) => {
        const updated = [...prev];
        updated[existingIndex] = { date, weight };
        return updated;
      });
    } else {
      setWeightData((prev) => [...prev, { date, weight }]);
    }
  };

  const getHabitById = (id: string) => {
    return habits.find((habit) => habit.id === id);
  };

  const getStreakForHabit = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return 0;

    return getHabitStreak(habit);
  };

  const shouldTrackHabitToday = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return false;

    return shouldTrackHabitOnDate(habit, new Date());
  };

  const isHabitCompletedToday = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return false;

    return isHabitCompletedForPeriod(habit, new Date());
  };

  const getSleepStats = () => {
    const validEntries = sleepData.filter((entry) => entry.hours > 0);
    if (validEntries.length === 0)
      return { avgHours: 0, avgScore: 0, recentTrend: "stable" };

    const totalHours = validEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0
    );
    const totalScore = validEntries.reduce(
      (sum, entry) => sum + entry.score,
      0
    );

    // Sort entries by date for trend analysis
    const sortedEntries = [...validEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Determine trend (improving, declining, stable)
    let recentTrend = "stable";
    if (sortedEntries.length >= 3) {
      const recent = sortedEntries.slice(0, 3);
      const avgRecent =
        recent.reduce((sum, entry) => sum + entry.hours, 0) / recent.length;
      const older = sortedEntries.slice(3, 6);
      if (older.length > 0) {
        const avgOlder =
          older.reduce((sum, entry) => sum + entry.hours, 0) / older.length;
        if (avgRecent > avgOlder + 0.5) recentTrend = "improving";
        else if (avgRecent < avgOlder - 0.5) recentTrend = "declining";
      }
    }

    return {
      avgHours: parseFloat((totalHours / validEntries.length).toFixed(1)),
      avgScore: Math.round(totalScore / validEntries.length),
      recentTrend,
    };
  };

  // New quick complete function for better UX
  const completeHabit = (id: string, date: string, value?: number) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    // Check if the habit should be tracked on this date
    const dateObj = new Date(date);
    if (!shouldTrackHabitOnDate(habit, dateObj)) {
      console.warn(`Habit ${habit.name} is not scheduled for ${date}`);
      return;
    }

    let completionValue: number;

    switch (habit.trackingType) {
      case "completion":
        completionValue = habit.target; // Mark as complete
        break;
      case "duration":
      case "quantity":
        completionValue = value || habit.target; // Use provided value or target
        break;
      case "increment":
        completionValue = (habit.entries[date] || 0) + (value || 1); // Add to existing
        break;
      default:
        completionValue = value || habit.target;
    }

    updateHabitEntry(id, date, completionValue);
  };

  // Profile and settings management
  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...profileData };
    setUserProfile(updatedProfile);
    AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
  };

  const updateSettings = (settingsData: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...settingsData };
    setSettings(updatedSettings);
    AsyncStorage.setItem("appSettings", JSON.stringify(updatedSettings));
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "habits",
        "memorableMoments",
        "sleepData",
        "weightData",
        "userProfile",
        "appSettings",
      ]);
      setHabits([]);
      setMemorableMoments([]);
      setSleepData([]);
      setWeightData([]);
      setUserProfile(defaultProfile);
      setSettings(defaultSettings);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        memorableMoments,
        sleepData,
        weightData,
        userProfile,
        settings,
        addHabit,
        updateHabit,
        updateHabitEntry,
        completeHabit,
        removeHabit,
        addMemorableMoment,
        addSleepEntry,
        addWeightEntry,
        getHabitById,
        getStreakForHabit,
        shouldTrackHabitToday,
        isHabitCompletedToday,
        getSleepStats,
        updateUserProfile,
        updateSettings,
        clearAllData,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
};

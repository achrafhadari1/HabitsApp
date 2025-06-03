import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import {
  Habit,
  MemorableMoment,
  SleepEntry,
  WeightEntry,
  HabitsContextType,
} from "../types";

// Sample habit to show when no habits exist
const getSampleHabit = (): Habit => ({
  id: "water",
  name: "Water",
  icon: "Droplets",
  target: 10,
  unit: "glasses",
  entries: {},
});

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

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedHabits = await AsyncStorage.getItem("habits");
        const savedMoments = await AsyncStorage.getItem("memorableMoments");
        const savedSleep = await AsyncStorage.getItem("sleepData");
        const savedWeight = await AsyncStorage.getItem("weightData");

        if (savedHabits) {
          const parsedHabits = JSON.parse(savedHabits);
          setHabits(
            parsedHabits.length > 0 ? parsedHabits : [getSampleHabit()]
          );
        } else {
          setHabits([getSampleHabit()]);
        }

        if (savedMoments) setMemorableMoments(JSON.parse(savedMoments));
        if (savedSleep) setSleepData(JSON.parse(savedSleep));
        if (savedWeight) setWeightData(JSON.parse(savedWeight));
      } catch (error) {
        console.error("Error loading data:", error);
        setHabits([getSampleHabit()]);
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
    if (habits.length > 0) saveHabits();
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
          return {
            ...habit,
            entries: {
              ...habit.entries,
              [date]: value,
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

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 100; i++) {
      // Limit to prevent infinite loop
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "yyyy-MM-dd");

      if (
        habit.entries[dateStr] !== undefined &&
        habit.entries[dateStr] >= habit.target
      ) {
        streak++;
      } else if (i > 0) {
        // Don't break on the first day (today) if it's not yet completed
        break;
      }
    }

    return streak;
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

  return (
    <HabitsContext.Provider
      value={{
        habits,
        memorableMoments,
        sleepData,
        weightData,
        addHabit,
        updateHabit,
        updateHabitEntry,
        removeHabit,
        addMemorableMoment,
        addSleepEntry,
        addWeightEntry,
        getHabitById,
        getStreakForHabit,
        getSleepStats,
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

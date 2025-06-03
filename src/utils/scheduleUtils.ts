import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  getDay,
} from "date-fns";
import { Habit, HabitSchedule } from "../types";

/**
 * Get a consistent date string for the current timezone
 */
export const getCurrentDateString = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

/**
 * Get a date string for a specific date
 */
export const getDateString = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

/**
 * Check if a habit should be tracked on a specific date based on its schedule
 */
export const shouldTrackHabitOnDate = (habit: Habit, date: Date): boolean => {
  if (!habit.schedule || habit.schedule.type === "daily") {
    return true; // Daily habits are tracked every day
  }

  if (habit.schedule.type === "custom" && habit.schedule.days) {
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    return habit.schedule.days.includes(dayOfWeek);
  }

  if (habit.schedule.type === "weekly") {
    // For weekly habits, we need to check if the user has already completed
    // the required frequency for this week
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const completedDaysThisWeek = getCompletedDaysInWeek(
      habit,
      weekStart,
      weekEnd
    );
    const requiredFrequency = habit.schedule.frequency || 1;

    // Allow tracking if we haven't reached the weekly target yet
    return completedDaysThisWeek < requiredFrequency;
  }

  return true;
};

/**
 * Get the number of completed days for a habit within a specific week
 */
export const getCompletedDaysInWeek = (
  habit: Habit,
  weekStart: Date,
  weekEnd: Date
): number => {
  let completedDays = 0;
  const currentDate = new Date(weekStart);

  while (currentDate <= weekEnd) {
    const dateStr = getDateString(currentDate);
    const entryValue = habit.entries[dateStr] || 0;

    if (entryValue >= habit.target) {
      completedDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return completedDays;
};

/**
 * Get the remaining days needed for a weekly habit
 */
export const getRemainingDaysForWeeklyHabit = (
  habit: Habit,
  date: Date
): number => {
  if (!habit.schedule || habit.schedule.type !== "weekly") {
    return 0;
  }

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const completedDays = getCompletedDaysInWeek(habit, weekStart, weekEnd);
  const requiredFrequency = habit.schedule.frequency || 1;

  return Math.max(0, requiredFrequency - completedDays);
};

/**
 * Check if a habit is completed for the current period (day/week)
 */
export const isHabitCompletedForPeriod = (
  habit: Habit,
  date: Date
): boolean => {
  const dateStr = getDateString(date);

  if (!habit.schedule || habit.schedule.type === "daily") {
    return (habit.entries[dateStr] || 0) >= habit.target;
  }

  if (habit.schedule.type === "custom") {
    // For custom schedules, check if today is a scheduled day and if it's completed
    if (!shouldTrackHabitOnDate(habit, date)) {
      return true; // Not a scheduled day, so consider it "completed"
    }
    return (habit.entries[dateStr] || 0) >= habit.target;
  }

  if (habit.schedule.type === "weekly") {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const completedDays = getCompletedDaysInWeek(habit, weekStart, weekEnd);
    const requiredFrequency = habit.schedule.frequency || 1;

    return completedDays >= requiredFrequency;
  }

  return false;
};

/**
 * Get the current streak for a habit considering its schedule
 */
export const getHabitStreak = (habit: Habit): number => {
  let streak = 0;
  const today = new Date();

  if (!habit.schedule || habit.schedule.type === "daily") {
    // Daily habit streak calculation
    for (let i = 0; i < 365; i++) {
      // Limit to prevent infinite loop
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);

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
  } else if (habit.schedule.type === "custom") {
    // Custom schedule streak calculation
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      if (shouldTrackHabitOnDate(habit, date)) {
        const dateStr = getDateString(date);
        if (
          habit.entries[dateStr] !== undefined &&
          habit.entries[dateStr] >= habit.target
        ) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
    }
  } else if (habit.schedule.type === "weekly") {
    // Weekly habit streak calculation (count weeks)
    for (let i = 0; i < 52; i++) {
      // Check up to 52 weeks
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - i * 7);

      if (isHabitCompletedForPeriod(habit, weekDate)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
  }

  return streak;
};

/**
 * Get the display text for a habit's schedule
 */
export const getScheduleDisplayText = (habit: Habit): string => {
  if (!habit.schedule || habit.schedule.type === "daily") {
    return "Daily";
  }

  if (habit.schedule.type === "weekly") {
    const frequency = habit.schedule.frequency || 1;
    return `${frequency} time${frequency > 1 ? "s" : ""} per week`;
  }

  if (habit.schedule.type === "custom" && habit.schedule.days) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const selectedDays = habit.schedule.days
      .map((day) => dayNames[day])
      .join(", ");
    return `Custom: ${selectedDays}`;
  }

  return "Custom";
};

/**
 * Get the progress text for a habit based on its schedule
 */
export const getHabitProgressText = (habit: Habit, date: Date): string => {
  const dateStr = getDateString(date);
  const currentValue = habit.entries[dateStr] || 0;

  if (!habit.schedule || habit.schedule.type === "daily") {
    return `${currentValue} / ${habit.target} ${habit.unit}`;
  }

  if (habit.schedule.type === "custom") {
    if (!shouldTrackHabitOnDate(habit, date)) {
      return "Not scheduled today";
    }
    return `${currentValue} / ${habit.target} ${habit.unit}`;
  }

  if (habit.schedule.type === "weekly") {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const completedDays = getCompletedDaysInWeek(habit, weekStart, weekEnd);
    const requiredFrequency = habit.schedule.frequency || 1;

    return `${completedDays} / ${requiredFrequency} days this week`;
  }

  return `${currentValue} / ${habit.target} ${habit.unit}`;
};

/**
 * Create a habit schedule based on the provided parameters
 */
export const createHabitSchedule = (
  scheduleType: "daily" | "weekly" | "custom",
  frequency?: number,
  selectedDays?: number[]
): HabitSchedule => {
  if (scheduleType === "daily") {
    return { type: "daily" };
  }

  if (scheduleType === "weekly") {
    return {
      type: "weekly",
      frequency: frequency || 1,
    };
  }

  if (scheduleType === "custom") {
    return {
      type: "custom",
      days: selectedDays || [],
    };
  }

  // Default to daily
  return { type: "daily" };
};

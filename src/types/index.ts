export type HabitTrackingType =
  | "increment"
  | "completion"
  | "duration"
  | "quantity";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  trackingType: HabitTrackingType;
  isTargetFlexible?: boolean; // Allow exceeding target (for running, reading, etc.)
  quickValues?: number[]; // Quick action values (e.g., [250, 500, 1000] for water)
  schedule?: {
    type: "daily" | "weekly" | "custom";
    days?: number[]; // 0-6 for days of week (0 = Sunday)
    frequency?: number; // times per week/month
  };
  entries: {
    [date: string]: number;
  };
};

export type MemorableMoment = {
  date: string;
  text: string;
};

export type SleepEntry = {
  date: string;
  hours: number;
  score: number;
  timestamp?: number; // Optional timestamp for sorting
};

export type WeightEntry = {
  date: string;
  weight: number;
};

export type UserProfile = {
  name: string;
  email?: string;
  profileImage?: string;
  joinDate: string;
  timezone: string;
};

export type AppSettings = {
  notifications: {
    enabled: boolean;
    reminderTime: string; // HH:MM format
    soundEnabled: boolean;
  };
  theme: "light" | "dark" | "auto";
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  units: {
    weight: "kg" | "lbs";
    distance: "km" | "miles";
  };
};

export type HabitsContextType = {
  habits: Habit[];
  memorableMoments: MemorableMoment[];
  sleepData: SleepEntry[];
  weightData: WeightEntry[];
  userProfile: UserProfile;
  settings: AppSettings;
  addHabit: (habit: Omit<Habit, "id" | "entries">) => void;
  updateHabit: (id: string, habit: Omit<Habit, "id" | "entries">) => void;
  updateHabitEntry: (id: string, date: string, value: number) => void;
  completeHabit: (id: string, date: string, value?: number) => void; // New quick complete method
  removeHabit: (id: string) => void;
  addMemorableMoment: (date: string, text: string) => void;
  addSleepEntry: (date: string, hours: number, score: number) => void;
  getSleepStats: () => { avgHours: number; avgScore: number };
  addWeightEntry: (date: string, weight: number) => void;
  getHabitById: (id: string) => Habit | undefined;
  getStreakForHabit: (id: string) => number;
  shouldTrackHabitToday: (id: string) => boolean;
  isHabitCompletedToday: (id: string) => boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => Promise<void>;
};

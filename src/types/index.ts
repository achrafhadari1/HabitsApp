export type Habit = {
  id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  schedule?: {
    type: 'daily' | 'weekly' | 'custom';
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

export type HabitsContextType = {
  habits: Habit[];
  memorableMoments: MemorableMoment[];
  sleepData: SleepEntry[];
  weightData: WeightEntry[];
  addHabit: (habit: Omit<Habit, 'id' | 'entries'>) => void;
  updateHabit: (id: string, habit: Omit<Habit, 'id' | 'entries'>) => void;
  updateHabitEntry: (id: string, date: string, value: number) => void;
  removeHabit: (id: string) => void;
  addMemorableMoment: (date: string, text: string) => void;
  addSleepEntry: (date: string, hours: number, score: number) => void;
  getSleepStats: () => { avgHours: number; avgScore: number };
  addWeightEntry: (date: string, weight: number) => void;
  getHabitById: (id: string) => Habit | undefined;
  getStreakForHabit: (id: string) => number;
};
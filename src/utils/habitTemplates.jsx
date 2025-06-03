import { HabitTrackingType } from "../types";

export interface HabitTemplate {
  name: string;
  icon: string;
  target: number;
  unit: string;
  trackingType: HabitTrackingType;
  isTargetFlexible?: boolean;
  quickValues?: number[];
  description: string;
  category: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Health & Fitness
  {
    name: "Drink Water",
    icon: "water",
    target: 2000,
    unit: "ml",
    trackingType: "quantity",
    quickValues: [250, 500, 750, 1000],
    description: "Stay hydrated throughout the day",
    category: "Health",
  },
  {
    name: "Yoga",
    icon: "body",
    target: 30,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [15, 30, 45, 60],
    description: "Practice yoga for flexibility and mindfulness",
    category: "Fitness",
  },
  {
    name: "Running",
    icon: "walk",
    target: 3,
    unit: "km",
    trackingType: "quantity",
    isTargetFlexible: true,
    quickValues: [1, 3, 5, 10],
    description: "Go for a run to improve cardiovascular health",
    category: "Fitness",
  },
  {
    name: "Meditation",
    icon: "leaf",
    target: 10,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [5, 10, 15, 20],
    description: "Practice mindfulness and reduce stress",
    category: "Wellness",
  },
  {
    name: "Workout",
    icon: "fitness",
    target: 1,
    unit: "session",
    trackingType: "completion",
    description: "Complete a workout session",
    category: "Fitness",
  },
  {
    name: "Walk",
    icon: "walk",
    target: 10000,
    unit: "steps",
    trackingType: "quantity",
    isTargetFlexible: true,
    quickValues: [2500, 5000, 7500, 10000],
    description: "Take steps for better health",
    category: "Fitness",
  },

  // Learning & Growth
  {
    name: "Read",
    icon: "book",
    target: 30,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [15, 30, 45, 60],
    description: "Read books or articles to expand knowledge",
    category: "Learning",
  },
  {
    name: "Study",
    icon: "school",
    target: 60,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [30, 60, 90, 120],
    description: "Dedicated study time for learning",
    category: "Learning",
  },
  {
    name: "Practice Instrument",
    icon: "musical-notes",
    target: 30,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [15, 30, 45, 60],
    description: "Practice playing a musical instrument",
    category: "Learning",
  },

  // Productivity
  {
    name: "Journal",
    icon: "create",
    target: 1,
    unit: "entry",
    trackingType: "completion",
    description: "Write in your journal for reflection",
    category: "Productivity",
  },
  {
    name: "Plan Tomorrow",
    icon: "calendar",
    target: 1,
    unit: "session",
    trackingType: "completion",
    description: "Plan your tasks for the next day",
    category: "Productivity",
  },
  {
    name: "Deep Work",
    icon: "time",
    target: 120,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [60, 90, 120, 180],
    description: "Focused work without distractions",
    category: "Productivity",
  },

  // Social & Relationships
  {
    name: "Call Family",
    icon: "call",
    target: 1,
    unit: "call",
    trackingType: "completion",
    description: "Stay connected with family members",
    category: "Social",
  },
  {
    name: "Social Time",
    icon: "people",
    target: 60,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [30, 60, 90, 120],
    description: "Spend quality time with friends or family",
    category: "Social",
  },

  // Self-Care
  {
    name: "Skincare",
    icon: "happy",
    target: 1,
    unit: "routine",
    trackingType: "completion",
    description: "Complete your skincare routine",
    category: "Self-Care",
  },
  {
    name: "Take Vitamins",
    icon: "medical",
    target: 1,
    unit: "dose",
    trackingType: "completion",
    description: "Take your daily vitamins",
    category: "Health",
  },
  {
    name: "Stretch",
    icon: "body",
    target: 10,
    unit: "min",
    trackingType: "duration",
    isTargetFlexible: true,
    quickValues: [5, 10, 15, 20],
    description: "Stretch to improve flexibility",
    category: "Wellness",
  },

  // Custom increment habits
  {
    name: "Pushups",
    icon: "fitness",
    target: 20,
    unit: "reps",
    trackingType: "increment",
    isTargetFlexible: true,
    description: "Do pushups for upper body strength",
    category: "Fitness",
  },
  {
    name: "Gratitude",
    icon: "heart",
    target: 3,
    unit: "items",
    trackingType: "increment",
    description: "Write down things you're grateful for",
    category: "Wellness",
  },
];

export const HABIT_CATEGORIES = [
  "Health",
  "Fitness",
  "Wellness",
  "Learning",
  "Productivity",
  "Social",
  "Self-Care",
];

export function getHabitsByCategory(category: string): HabitTemplate[] {
  return HABIT_TEMPLATES.filter((template) => template.category === category);
}

export function getTrackingTypeDescription(type: HabitTrackingType): string {
  switch (type) {
    case "completion":
      return "Mark as complete when done";
    case "duration":
      return "Track time spent on activity";
    case "quantity":
      return "Track amount or distance";
    case "increment":
      return "Count repetitions or occurrences";
    default:
      return "Track your progress";
  }
}

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type HabitHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'HabitHistory'>;
type HabitHistoryRouteProp = RouteProp<RootStackParamList, 'HabitHistory'>;

const HabitHistoryScreen: React.FC = () => {
  const navigation = useNavigation<HabitHistoryNavigationProp>();
  const route = useRoute<HabitHistoryRouteProp>();
  const { habitId } = route.params;
  const { getHabitById } = useHabits();
  
  const habit = getHabitById(habitId);
  const today = new Date();
  const currentMonth = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: currentMonth, end: monthEnd });

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Habit not found</Text>
      </SafeAreaView>
    );
  }

  const isWater = habit.name.toLowerCase().includes('water');

  const renderCalendarDay = (date: Date, index: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayNumber = format(date, 'd');
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    const entryValue = habit.entries[dateStr] || 0;
    const isCompleted = entryValue >= habit.target;
    const hasEntry = entryValue > 0;

    return (
      <View
        key={index}
        style={[
          styles.calendarDay,
          isCompleted && styles.calendarDayCompleted,
          hasEntry && !isCompleted && styles.calendarDayPartial,
          isToday && styles.calendarDayToday,
        ]}
      >
        <Text
          style={[
            styles.calendarDayText,
            isCompleted && styles.calendarDayTextCompleted,
            hasEntry && !isCompleted && styles.calendarDayTextPartial,
            isToday && styles.calendarDayTextToday,
          ]}
        >
          {dayNumber}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isWater && styles.waterContainer]}>
      <StatusBar barStyle="dark-content" backgroundColor={isWater ? "#dbeafe" : "#ffffff"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.habitInfo}>
          <Ionicons name="water" size={16} color="#6b7280" />
          <Text style={styles.habitName}>{habit.name.toLowerCase()}</Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* History Title */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyLabel}>habit</Text>
          <Text style={styles.historyTitle}>history</Text>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarGrid}>
            {/* Add empty cells for proper alignment */}
            {Array.from({ length: currentMonth.getDay() }, (_, index) => (
              <View key={`empty-${index}`} style={styles.calendarDay} />
            ))}
            
            {daysInMonth.map((date, index) => renderCalendarDay(date, index))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotEmpty]} />
            <Text style={styles.legendText}>No activity</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotPartial]} />
            <Text style={styles.legendText}>Partial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotCompleted]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.values(habit.entries).filter(value => value >= habit.target).length}
            </Text>
            <Text style={styles.statLabel}>Days completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((Object.values(habit.entries).filter(value => value >= habit.target).length / daysInMonth.length) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Success rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.values(habit.entries).reduce((sum, value) => sum + value, 0)}
            </Text>
            <Text style={styles.statLabel}>Total {habit.unit}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  waterContainer: {
    backgroundColor: '#dbeafe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  habitName: {
    marginLeft: 6,
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyHeader: {
    marginBottom: 30,
  },
  historyLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '300',
  },
  historyTitle: {
    fontSize: 32,
    color: '#111827',
    fontWeight: '300',
    marginTop: 2,
  },
  calendarContainer: {
    marginBottom: 30,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 20,
  },
  calendarDayCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  calendarDayPartial: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  calendarDayToday: {
    backgroundColor: '#000000',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '300',
  },
  calendarDayTextCompleted: {
    color: '#111827',
    fontWeight: '500',
  },
  calendarDayTextPartial: {
    color: '#374151',
    fontWeight: '400',
  },
  calendarDayTextToday: {
    color: '#ffffff',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendDotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  legendDotPartial: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  legendDotCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  legendDotToday: {
    backgroundColor: '#000000',
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '300',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '300',
    textAlign: 'center',
  },
});

export default HabitHistoryScreen;
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { format } from 'date-fns';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type HabitDetailNavigationProp = StackNavigationProp<RootStackParamList, 'HabitDetail'>;
type HabitDetailRouteProp = RouteProp<RootStackParamList, 'HabitDetail'>;

const HabitDetailScreen: React.FC = () => {
  const navigation = useNavigation<HabitDetailNavigationProp>();
  const route = useRoute<HabitDetailRouteProp>();
  const { habitId } = route.params;
  const { getHabitById, updateHabitEntry } = useHabits();
  
  const habit = getHabitById(habitId);
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentValue = habit?.entries[today] || 0;

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Habit not found</Text>
      </SafeAreaView>
    );
  }

  const handleIncrement = () => {
    if (currentValue < habit.target) {
      updateHabitEntry(habit.id, today, currentValue + 1);
    }
  };

  const handleDecrement = () => {
    if (currentValue > 0) {
      updateHabitEntry(habit.id, today, currentValue - 1);
    }
  };

  const isWater = habit.name.toLowerCase().includes('water');

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

      {/* Main Counter */}
      <View style={styles.counterSection}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={styles.counterButton}
          disabled={currentValue <= 0}
        >
          <Ionicons 
            name="remove" 
            size={24} 
            color={currentValue <= 0 ? "#d1d5db" : "#374151"} 
          />
        </TouchableOpacity>
        
        <View style={styles.counterDisplay}>
          <Text style={styles.counterNumber}>{currentValue}</Text>
          <Text style={styles.counterTarget}>of {habit.target} {habit.unit} / day</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleIncrement}
          style={[styles.counterButton, styles.incrementButton]}
          disabled={currentValue >= habit.target}
        >
          <Ionicons 
            name="add" 
            size={24} 
            color={currentValue >= habit.target ? "#d1d5db" : "#ffffff"} 
          />
        </TouchableOpacity>
      </View>

      {/* History Section */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyLabel}>habit</Text>
          <Text style={styles.historyTitle}>history</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('HabitHistory', { habitId: habit.id })}
          style={styles.historyButton}
        >
          <Ionicons name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Calendar Preview */}
      <View style={styles.calendarPreview}>
        {/* This would show a mini calendar - simplified for now */}
        <View style={styles.calendarGrid}>
          {Array.from({ length: 35 }, (_, index) => {
            const dayNumber = index + 1;
            const isCompleted = Math.random() > 0.6; // Mock completion data
            const isToday = dayNumber === 15; // Mock today
            
            return (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  isCompleted && styles.calendarDayCompleted,
                  isToday && styles.calendarDayToday,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isCompleted && styles.calendarDayTextCompleted,
                    isToday && styles.calendarDayTextToday,
                  ]}
                >
                  {dayNumber <= 31 ? dayNumber : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
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
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
    marginBottom: 60,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementButton: {
    backgroundColor: '#000000',
  },
  counterDisplay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  counterNumber: {
    fontSize: 120,
    fontWeight: '100',
    color: '#111827',
    lineHeight: 120,
  },
  counterTarget: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '300',
    marginTop: 8,
  },
  historySection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  historyHeader: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '300',
  },
  historyTitle: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '300',
    marginTop: 2,
  },
  historyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPreview: {
    flex: 1,
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  calendarDayToday: {
    backgroundColor: '#000000',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '300',
  },
  calendarDayTextCompleted: {
    color: '#111827',
    fontWeight: '400',
  },
  calendarDayTextToday: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default HabitDetailScreen;
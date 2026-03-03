import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WEEK_DAYS, generateCalendarDays, CalendarDay } from '../utils/calendar';
import { Colors } from '../utils/colors';
import { useEvents } from '../hooks/useEvents';

interface Props {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
}

const DayCell = memo(
  ({
    item,
    isSelected,
    hasEvent,
    onPress,
  }: {
    item: CalendarDay;
    isSelected: boolean;
    hasEvent: boolean;
    onPress: () => void;
  }) => {
    const isWeekend = new Date(item.year, item.month, item.day).getDay() % 6 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          item.isToday && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.dayText,
            !item.isCurrentMonth && styles.otherMonthText,
            item.isToday && styles.todayText,
            isSelected && styles.selectedText,
            item.isCurrentMonth && isWeekend && !isSelected && !item.isToday && styles.weekendText,
          ]}
        >
          {item.day}
        </Text>
        {hasEvent && (
          <View
            style={[
              styles.eventDot,
              (isSelected || item.isToday) && styles.eventDotLight,
            ]}
          />
        )}
      </TouchableOpacity>
    );
  },
);

export default function CalendarGrid({
  year,
  month,
  selectedDate,
  onSelectDate,
}: Props) {
  const { hasEvents } = useEvents();
  const days = generateCalendarDays(year, month);

  return (
    <View style={styles.container}>
      {/* 星期标题行 */}
      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((day, index) => (
          <View key={day} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                (index === 0 || index === 6) && styles.weekendHeader,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 日期网格 */}
      <View style={styles.grid}>
        {days.map((item, index) => (
          <DayCell
            key={`${item.dateKey}-${index}`}
            item={item}
            isSelected={selectedDate === item.dateKey}
            hasEvent={hasEvents(item.dateKey)}
            onPress={() => onSelectDate(item.dateKey)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  weekendHeader: {
    color: Colors.weekend,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 6,
    height: 48,
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '400',
  },
  otherMonthText: {
    color: Colors.textLight,
  },
  weekendText: {
    color: Colors.weekend,
  },
  todayCell: {
    backgroundColor: Colors.today,
    borderRadius: 20,
    width: 40,
    marginHorizontal: 'auto' as any,
  },
  todayText: {
    color: Colors.white,
    fontWeight: '700',
  },
  selectedCell: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    marginHorizontal: 'auto' as any,
  },
  selectedText: {
    color: Colors.white,
    fontWeight: '700',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.eventDot,
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
  eventDotLight: {
    backgroundColor: Colors.white,
  },
});

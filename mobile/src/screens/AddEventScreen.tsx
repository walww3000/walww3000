import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Colors, EVENT_COLORS } from '../utils/colors';
import { formatDisplayDate } from '../utils/calendar';
import { useEvents } from '../hooks/useEvents';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEvent'>;

export default function AddEventScreen({ navigation, route }: Props) {
  const { dateKey } = route.params;
  const { addEvent } = useEvents();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [note, setNote] = useState('');
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入事件标题');
      return;
    }

    addEvent({
      title: title.trim(),
      dateKey,
      startTime,
      endTime,
      color: selectedColor,
      note: note.trim(),
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 日期显示 */}
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>日期</Text>
          <Text style={styles.dateValue}>{formatDisplayDate(dateKey)}</Text>
        </View>

        {/* 标题输入 */}
        <View style={styles.section}>
          <Text style={styles.label}>事件标题</Text>
          <TextInput
            style={styles.input}
            placeholder="输入事件标题..."
            placeholderTextColor={Colors.textLight}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            autoFocus
          />
        </View>

        {/* 时间选择 */}
        <View style={styles.section}>
          <Text style={styles.label}>时间</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>开始</Text>
              <TextInput
                style={styles.timeField}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                placeholderTextColor={Colors.textLight}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <Text style={styles.timeSeparator}>—</Text>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>结束</Text>
              <TextInput
                style={styles.timeField}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="10:00"
                placeholderTextColor={Colors.textLight}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        {/* 颜色选择 */}
        <View style={styles.section}>
          <Text style={styles.label}>颜色标记</Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Text style={styles.colorCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.label}>备注</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="添加备注..."
            placeholderTextColor={Colors.textLight}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存事件</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  dateCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 18,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteInput: {
    minHeight: 100,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  timeField: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 18,
    color: Colors.textLight,
    marginHorizontal: 12,
    marginTop: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

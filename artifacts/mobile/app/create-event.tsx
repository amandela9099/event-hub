import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCategory } from '../constants/types';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { useColors } from '../hooks/useColors';

const CATEGORIES: EventCategory[] = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

export default function CreateEventScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addEvent } = useEvents();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical');
  const [tags, setTags] = useState('');
  const [requirements, setRequirements] = useState('');
  const [hasCertificate, setHasCertificate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !date.trim() || !time.trim() || !venue.trim() || !capacity.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const cap = parseInt(capacity);
    if (isNaN(cap) || cap <= 0) {
      Alert.alert('Error', 'Please enter a valid capacity');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    await addEvent({
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      endTime: endTime.trim() || time.trim(),
      venue: venue.trim(),
      capacity: cap,
      category,
      organizer: user?.name || 'Faculty',
      organizerId: user?.id || '',
      status: 'upcoming',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      requirements: requirements.trim() || undefined,
      hasCertificate,
    });
    setIsLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Event created successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const Field = ({ label, icon, value, onChange, placeholder, multiline, keyboardType, hint }: any) => (
    <View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      {hint && <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>}
      <View style={[
        styles.inputWrap,
        { backgroundColor: colors.card, borderColor: colors.border },
        multiline && styles.multiline,
      ]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} style={multiline && { marginTop: 2 }} />
        <TextInput
          style={[styles.input, { color: colors.foreground }, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="sentences"
          autoCorrect
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: '#2196F3',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Event</Text>
        <Pressable
          onPress={handleCreate}
          disabled={isLoading}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.saveBtnText}>{isLoading ? 'Saving...' : 'Publish'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'web' ? 54 : 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Field label="Event Title *" icon="type" value={title} onChange={setTitle} placeholder="Enter event name" />
          <Field label="Description *" icon="align-left" value={description} onChange={setDescription} placeholder="Describe the event..." multiline />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Date *" icon="calendar" value={date} onChange={setDate} placeholder="YYYY-MM-DD" hint="e.g. 2025-09-15" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Start Time *" icon="clock" value={time} onChange={setTime} placeholder="HH:MM AM/PM" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="End Time" icon="clock" value={endTime} onChange={setEndTime} placeholder="HH:MM AM/PM" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Capacity *" icon="users" value={capacity} onChange={setCapacity} placeholder="e.g. 100" keyboardType="number-pad" />
            </View>
          </View>

          <Field label="Venue *" icon="map-pin" value={venue} onChange={setVenue} placeholder="Location / Room" />

          {/* Category */}
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    { backgroundColor: category === cat ? colors.primary : colors.muted, borderColor: category === cat ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={[styles.catChipText, { color: category === cat ? '#fff' : colors.mutedForeground }]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Field label="Tags" icon="tag" value={tags} onChange={setTags} placeholder="Comma separated: AI, Workshop, Tech" hint="Optional" />
          <Field label="Requirements" icon="info" value={requirements} onChange={setRequirements} placeholder="Prerequisites or materials needed..." multiline hint="Optional" />

          {/* Certificate Toggle */}
          <Pressable
            onPress={() => setHasCertificate(v => !v)}
            style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.toggleIcon, { backgroundColor: colors.muted }]}>
              <Feather name="award" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Issue Certificate</Text>
              <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>Attendees receive a digital certificate</Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: hasCertificate ? colors.primary : colors.muted }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: hasCertificate ? 18 : 2 }] }]} />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  saveBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  content: { padding: 20 },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4, marginTop: -2 },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  multiline: { alignItems: 'flex-start' },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  categoryRow: { gap: 8, paddingBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  toggleIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  toggleSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  toggle: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
});

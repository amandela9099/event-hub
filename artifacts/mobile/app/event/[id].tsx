import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

const CATEGORY_COLORS: Record<string, string> = {
  Technical: '#5B4FE8', Cultural: '#E91E8C', Sports: '#10B981',
  Workshop: '#F59E0B', Seminar: '#2196F3', Other: '#8E8FA3',
};

export default function EventDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { events, registerForEvent, unregisterFromEvent, isRegistered, getRegistration } = useEvents();
  const [isLoading, setIsLoading] = useState(false);

  const event = events.find(e => e.id === id);
  if (!event) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Event not found</Text>
    </View>
  );

  const registered = user ? isRegistered(event.id, user.id) : false;
  const registration = user ? getRegistration(event.id, user.id) : undefined;
  const isFull = event.registered >= event.capacity;
  const fillPct = Math.round((event.registered / event.capacity) * 100);
  const catColor = CATEGORY_COLORS[event.category] || colors.primary;

  const handleRegister = async () => {
    if (!user) { Alert.alert('Error', 'Please login first'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    const result = await registerForEvent(event.id, user.id);
    setIsLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Registered!', 'Your QR ticket has been generated. Check "My Events" to view it.');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleUnregister = () => {
    Alert.alert('Cancel Registration', 'Are you sure?', [
      { text: 'Keep Registration', style: 'cancel' },
      {
        text: 'Cancel Registration',
        style: 'destructive',
        onPress: async () => {
          if (user) await unregisterFromEvent(event.id, user.id);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: catColor + '25' }]}>
          <View style={[styles.heroIcon, { backgroundColor: catColor + '30' }]}>
            <Feather
              name={event.category === 'Sports' ? 'award' : event.category === 'Cultural' ? 'music' : 'zap'}
              size={56}
              color={catColor}
            />
          </View>
        </View>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, {
            backgroundColor: colors.card,
            top: insets.top + (Platform.OS === 'web' ? 67 : 16),
          }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Badge label={event.category} color={catColor} />
            {event.hasCertificate && <Badge label="Certificate" color={colors.primary} />}
            <Badge
              label={event.status === 'upcoming' ? 'Upcoming' : event.status === 'completed' ? 'Completed' : 'Ongoing'}
              color={event.status === 'upcoming' ? colors.accent : event.status === 'completed' ? colors.mutedForeground : colors.success}
            />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            {[
              { icon: 'calendar', label: 'Date', value: event.date },
              { icon: 'clock', label: 'Time', value: `${event.time} — ${event.endTime}` },
              { icon: 'map-pin', label: 'Venue', value: event.venue },
              { icon: 'user', label: 'Organizer', value: event.organizer },
            ].map(item => (
              <View key={item.label} style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={item.icon as any} size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Capacity */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.capacityHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Capacity</Text>
              <Text style={[styles.capacityCount, { color: isFull ? colors.destructive : colors.primary }]}>
                {event.registered}/{event.capacity} {isFull ? '(Full)' : ''}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressFill, {
                width: `${fillPct}%` as any,
                backgroundColor: isFull ? colors.destructive : colors.primary,
              }]} />
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{event.description}</Text>
          </View>

          {event.requirements && (
            <View style={[styles.section, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
              <View style={styles.reqHeader}>
                <Feather name="alert-circle" size={16} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>Requirements</Text>
              </View>
              <Text style={[styles.description, { color: colors.foreground }]}>{event.requirements}</Text>
            </View>
          )}

          {event.speakers && event.speakers.length > 0 && (
            <View style={styles.descSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Speakers</Text>
              {event.speakers.map((s, i) => (
                <View key={i} style={styles.speakerRow}>
                  <View style={[styles.speakerDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.speakerName, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.tagsRow}>
            {event.tags.map(tag => <Badge key={tag} label={`#${tag}`} size="sm" />)}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      {user?.role === 'student' && event.status === 'upcoming' && (
        <View style={[styles.actionBar, {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16),
        }]}>
          {registered ? (
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => registration && router.push(`/qr-ticket/${registration.id}`)}
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
              >
                <Feather name="grid" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>View QR Ticket</Text>
              </Pressable>
              <Pressable
                onPress={handleUnregister}
                style={({ pressed }) => [styles.secondaryBtn, { borderColor: colors.destructive }, pressed && { opacity: 0.8 }]}
              >
                <Feather name="x" size={18} color={colors.destructive} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleRegister}
              disabled={isLoading || isFull}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: isFull ? colors.mutedForeground : colors.primary },
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.7 },
              ]}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Registering...' : isFull ? 'Event Full' : 'Register for Event'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 200, alignItems: 'center', justifyContent: 'center' },
  heroIcon: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 20, lineHeight: 32 },
  infoGrid: { gap: 10, marginBottom: 16 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  infoValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  section: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  capacityCount: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  descSection: { marginBottom: 16 },
  description: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 24, marginTop: 8 },
  reqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  speakerDot: { width: 6, height: 6, borderRadius: 3 },
  speakerName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  actionBar: { padding: 16, borderTopWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  secondaryBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});

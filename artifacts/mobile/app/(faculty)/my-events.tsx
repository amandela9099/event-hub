import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';
import { MOCK_USERS } from '../../constants/mockData';

export default function FacultyMyEvents() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getOrganizerEvents, getEventRegistrations, issueCertificate, events } = useEvents();

  const myEvents = user ? getOrganizerEvents(user.id) : [];

  const handleIssueCertificate = async (eventId: string, regId: string, userId: string) => {
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;
    const reg = getEventRegistrations(eventId).find(r => r.id === regId);
    if (!reg?.attended) {
      Alert.alert('Cannot Issue', 'Attendance must be marked first');
      return;
    }
    // Find user name from MOCK_USERS or use generic
    const attendeeName = `Attendee`;
    await issueCertificate(userId, eventId, attendeeName, evt.title);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Certificate issued successfully!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, {
        backgroundColor: '#2196F3',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Text style={styles.headerTitle}>My Events</Text>
        <Pressable
          onPress={() => router.push('/create-event')}
          style={styles.addBtn}
        >
          <Feather name="plus" size={22} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={myEvents}
        keyExtractor={e => e.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: event }) => {
          const regs = getEventRegistrations(event.id);
          const attended = regs.filter(r => r.attended).length;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: event.status === 'upcoming' ? colors.primary + '20' : colors.success + '20',
                }]}>
                  <Text style={[styles.statusText, {
                    color: event.status === 'upcoming' ? colors.primary : colors.success,
                  }]}>{event.status}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Feather name="calendar" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.date} • {event.time}</Text>
              </View>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>{event.venue}</Text>
              </View>

              <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.foreground }]}>{regs.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Registered</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.foreground }]}>{attended}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Attended</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.foreground }]}>{event.capacity - event.registered}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Available</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push(`/event/${event.id}`)}
                  style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.muted }, pressed && { opacity: 0.8 }]}
                >
                  <Feather name="eye" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.actionText, { color: colors.mutedForeground }]}>View</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/(faculty)/scanner')}
                  style={({ pressed }) => [styles.actionBtn, { backgroundColor: '#2196F320' }, pressed && { opacity: 0.8 }]}
                >
                  <Feather name="maximize" size={14} color="#2196F3" />
                  <Text style={[styles.actionText, { color: '#2196F3' }]}>Scan QR</Text>
                </Pressable>
                {event.hasCertificate && attended > 0 && (
                  <Pressable
                    onPress={() => Alert.alert('Issue Certificates', `Issue certificates to ${attended} attendees?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Issue', onPress: async () => {
                        const regsAttended = regs.filter(r => r.attended);
                        for (const r of regsAttended) {
                          await issueCertificate(r.userId, event.id, 'Attendee', event.title);
                        }
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Done', `${regsAttended.length} certificates issued`);
                      }},
                    ])}
                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: '#10B98120' }, pressed && { opacity: 0.8 }]}
                  >
                    <Feather name="award" size={14} color="#10B981" />
                    <Text style={[styles.actionText, { color: '#10B981' }]}>Issue Certs</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No events created"
            subtitle="Create your first event to get started"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: 16, paddingBottom: 8 },
  eventTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 4 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, marginTop: 12 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statNum: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1 },
  actions: { flexDirection: 'row', gap: 8, padding: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
  actionText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});

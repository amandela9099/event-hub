import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function MyEventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { events, getUserRegistrations } = useEvents();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const registrations = user ? getUserRegistrations(user.id) : [];

  const { upcoming, past } = useMemo(() => {
    const regs = registrations.map(r => ({
      reg: r,
      event: events.find(e => e.id === r.eventId),
    })).filter(x => x.event);

    return {
      upcoming: regs.filter(x => x.event!.status === 'upcoming' || x.event!.status === 'ongoing'),
      past: regs.filter(x => x.event!.status === 'completed'),
    };
  }, [registrations, events]);

  const display = tab === 'upcoming' ? upcoming : past;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, {
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Events</Text>
        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          {(['upcoming', 'past'] as const).map(t => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary : 'transparent' }]}
            >
              <Text style={[styles.tabText, { color: tab === t ? '#fff' : colors.mutedForeground }]}>
                {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={display}
        keyExtractor={x => x.reg.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {item.event!.title}
                </Text>
                <View style={styles.metaRow}>
                  <Feather name="calendar" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.event!.date}</Text>
                  <Feather name="clock" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.event!.time}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.event!.venue}
                  </Text>
                </View>
              </View>
              {item.reg.attended && (
                <View style={[styles.attendedBadge, { backgroundColor: colors.success + '20' }]}>
                  <Feather name="check-circle" size={16} color={colors.success} />
                </View>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/event/${item.event!.id}`);
                }}
                style={[styles.actionBtn, { backgroundColor: colors.muted }]}
              >
                <Feather name="info" size={14} color={colors.mutedForeground} />
                <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Details</Text>
              </Pressable>

              {(item.event!.status === 'upcoming' || item.event!.status === 'ongoing') && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/qr-ticket/${item.reg.id}`);
                  }}
                  style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
                >
                  <Feather name="grid" size={14} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>QR Ticket</Text>
                </Pressable>
              )}

              {item.reg.attended && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/certificates');
                  }}
                  style={[styles.actionBtn, { backgroundColor: '#10B98120' }]}
                >
                  <Feather name="award" size={14} color="#10B981" />
                  <Text style={[styles.actionText, { color: '#10B981' }]}>Certificate</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark"
            title={tab === 'upcoming' ? "No upcoming registrations" : "No past events"}
            subtitle="Register for events to see them here"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { padding: 16 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16 },
  eventTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  attendedBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1 },
  actions: { flexDirection: 'row', gap: 8, padding: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
  actionText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});

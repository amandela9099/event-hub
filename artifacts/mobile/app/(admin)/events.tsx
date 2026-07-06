import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

const STATUS_COLORS: Record<string, string> = {
  upcoming: '#5B4FE8',
  ongoing: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export default function AdminEvents() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, getEventRegistrations } = useEvents();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return events.filter(e =>
      !search.trim() ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, {
        backgroundColor: '#10B981',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Text style={styles.headerTitle}>Events Management</Text>
        <Text style={styles.headerSub}>{events.length} total events</Text>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: event }) => {
          const regs = getEventRegistrations(event.id);
          const attended = regs.filter(r => r.attended).length;
          const statusColor = STATUS_COLORS[event.status] || colors.primary;

          return (
            <Pressable
              onPress={() => router.push(`/event/${event.id}`)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
                  <Text style={[styles.organizer, { color: colors.mutedForeground }]}>by {event.organizer}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{event.status}</Text>
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
                <View style={styles.stat}>
                  <Feather name="tag" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.statText, { color: colors.mutedForeground }]}>{event.category}</Text>
                </View>
                <View style={styles.stat}>
                  <Feather name="users" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.statText, { color: colors.mutedForeground }]}>{regs.length}/{event.capacity}</Text>
                </View>
                <View style={styles.stat}>
                  <Feather name="check-circle" size={12} color="#10B981" />
                  <Text style={[styles.statText, { color: '#10B981' }]}>{attended} attended</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' },
  list: { padding: 16 },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, paddingBottom: 8 },
  title: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  organizer: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, marginBottom: 3 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', gap: 16, padding: 12, borderTopWidth: 1, marginTop: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});

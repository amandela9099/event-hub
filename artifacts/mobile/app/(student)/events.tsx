import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../../components/EventCard';
import { EmptyState } from '../../components/EmptyState';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';
import { EventCategory } from '../../constants/types';

const CATEGORIES: (EventCategory | 'All')[] = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events } = useEvents();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<EventCategory | 'All'>('All');

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchCat = selected === 'All' || e.category === selected;
      const matchSearch = !search.trim() ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [events, search, selected]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Events</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search events..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selected === item ? colors.primary : colors.muted,
                  borderColor: selected === item ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[
                styles.categoryChipText,
                { color: selected === item ? '#fff' : colors.mutedForeground },
              ]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Events List */}
      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No events found"
            subtitle="Try a different search or category"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  categories: { gap: 8, paddingBottom: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  categoryChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  list: { padding: 20 },
});

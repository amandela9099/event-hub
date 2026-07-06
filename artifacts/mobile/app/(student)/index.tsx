import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../../components/EventCard';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function StudentHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { events, getUserRegistrations, getUserCertificates, getUserNotifications } = useEvents();

  const upcomingEvents = useMemo(() =>
    events.filter(e => e.status === 'upcoming').slice(0, 6),
    [events]
  );

  const featuredEvents = useMemo(() =>
    events.filter(e => e.status === 'upcoming').slice(0, 3),
    [events]
  );

  const registrations = user ? getUserRegistrations(user.id) : [];
  const certificates = user ? getUserCertificates(user.id) : [];
  const unreadNotifs = user
    ? getUserNotifications(user.id).filter(n => !n.read).length
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0),
      }}
    >
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.primary,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
      }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/notifications');
              }}
              style={[styles.notifBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            >
              <Feather name="bell" size={20} color="#fff" />
              {unreadNotifs > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifs}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.8)" />
          <Pressable
            style={{ flex: 1 }}
            onPress={() => router.push('/(student)/events')}
          >
            <Text style={styles.searchPlaceholder}>Search events...</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Registered" value={registrations.length} icon="bookmark" color={colors.primary} />
          <StatCard label="Certificates" value={certificates.length} icon="award" color="#10B981" />
          <StatCard label="Events" value={upcomingEvents.length} icon="calendar" color="#2196F3" />
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Events</Text>
            <Pressable onPress={() => router.push('/(student)/events')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={featuredEvents}
            keyExtractor={e => e.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            renderItem={({ item }) => (
              <View style={{ width: 280 }}>
                <EventCard event={item} />
              </View>
            )}
          />
        </View>

        {/* Quick Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse by Category</Text>
          <View style={styles.categoryGrid}>
            {[
              { name: 'Technical', icon: 'code', color: '#5B4FE8' },
              { name: 'Cultural', icon: 'music', color: '#E91E8C' },
              { name: 'Sports', icon: 'award', color: '#10B981' },
              { name: 'Workshop', icon: 'tool', color: '#F59E0B' },
            ].map(cat => (
              <Pressable
                key={cat.name}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(student)/events');
                }}
                style={({ pressed }) => [
                  styles.categoryCard,
                  { backgroundColor: cat.color + '15', borderColor: cat.color + '30' },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '25' }]}>
                  <Feather name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Events</Text>
          </View>
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Inter_400Regular' },
  userName: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  headerActions: { flexDirection: 'row', gap: 10 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  searchPlaceholder: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  content: { padding: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  seeAll: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 10 },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});

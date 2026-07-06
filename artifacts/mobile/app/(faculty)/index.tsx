import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../../components/EventCard';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function FacultyDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { events, registrations, getOrganizerEvents, getEventRegistrations } = useEvents();

  const myEvents = user ? getOrganizerEvents(user.id) : [];
  const totalRegistrations = myEvents.reduce((acc, e) => acc + getEventRegistrations(e.id).length, 0);
  const totalAttended = myEvents.reduce((acc, e) => {
    return acc + getEventRegistrations(e.id).filter(r => r.attended).length;
  }, 0);
  const upcomingCount = myEvents.filter(e => e.status === 'upcoming').length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }}
    >
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: '#2196F3',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
      }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Faculty Dashboard</Text>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.dept}>{user?.department}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/create-event')}
            style={({ pressed }) => [
              styles.createBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="plus" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard label="Total Events" value={myEvents.length} icon="calendar" color="#2196F3" small />
          <StatCard label="Upcoming" value={upcomingCount} icon="clock" color="#5B4FE8" small />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Registrations" value={totalRegistrations} icon="users" color="#F59E0B" small />
          <StatCard label="Attended" value={totalAttended} icon="check-circle" color="#10B981" small />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          </View>
          <View style={styles.actionGrid}>
            {[
              { icon: 'plus-circle', label: 'Create Event', color: '#2196F3', onPress: () => router.push('/create-event') },
              { icon: 'maximize', label: 'Scan QR', color: '#5B4FE8', onPress: () => router.push('/(faculty)/scanner') },
              { icon: 'users', label: 'Participants', color: '#10B981', onPress: () => router.push('/(faculty)/my-events') },
              { icon: 'award', label: 'Issue Certs', color: '#F59E0B', onPress: () => router.push('/(faculty)/my-events') },
            ].map(action => (
              <Pressable
                key={action.label}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  action.onPress();
                }}
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: action.color + '15', borderColor: action.color + '30' },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '25' }]}>
                  <Feather name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Events</Text>
            <Pressable onPress={() => router.push('/(faculty)/my-events')}>
              <Text style={[styles.seeAll, { color: '#2196F3' }]}>See all</Text>
            </Pressable>
          </View>
          {myEvents.slice(0, 3).length > 0 ? (
            myEvents.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="calendar" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No events created yet</Text>
              <Pressable
                onPress={() => router.push('/create-event')}
                style={[styles.createFirstBtn, { backgroundColor: '#2196F3' }]}
              >
                <Text style={styles.createFirstText}>Create First Event</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  welcome: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular' },
  name: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 2 },
  dept: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  createBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  seeAll: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 10 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16, borderWidth: 1, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  createFirstBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  createFirstText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

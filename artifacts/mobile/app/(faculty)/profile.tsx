import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function FacultyProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getOrganizerEvents, getEventRegistrations } = useEvents();

  const myEvents = user ? getOrganizerEvents(user.id) : [];
  const totalRegs = myEvents.reduce((acc, e) => acc + getEventRegistrations(e.id).length, 0);
  const totalAttended = myEvents.reduce((acc, e) =>
    acc + getEventRegistrations(e.id).filter(r => r.attended).length, 0);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }}
    >
      <View style={[styles.header, {
        backgroundColor: '#2196F3',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
      }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Feather name="user-check" size={12} color="#fff" />
          <Text style={styles.roleText}>FACULTY</Text>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Events Created', value: myEvents.length },
          { label: 'Total Registrations', value: totalRegs },
          { label: 'Attended', value: totalAttended },
        ].map((stat, i) => (
          <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#2196F3' }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROFILE INFO</Text>
        {user?.employeeId && (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="credit-card" size={18} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Employee ID</Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{user.employeeId}</Text>
          </View>
        )}
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="book" size={18} color={colors.primary} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Department</Text>
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{user?.department}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MANAGEMENT</Text>
        <Pressable
          onPress={() => router.push('/(faculty)/my-events')}
          style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.8 }]}
        >
          <Feather name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>My Events</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/create-event')}
          style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.8 }]}
        >
          <Feather name="plus-circle" size={18} color={colors.primary} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Create Event</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.8 }]}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.rowLabel, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontFamily: 'Inter_700Bold' },
  name: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsCard: { marginHorizontal: 20, marginTop: -20, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});

import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
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
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getUserRegistrations, getUserCertificates } = useEvents();

  const registrations = user ? getUserRegistrations(user.id) : [];
  const certificates = user ? getUserCertificates(user.id) : [];
  const attended = registrations.filter(r => r.attended).length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, value, onPress, danger }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? '#EF444420' : colors.muted }]}>
        <Feather name={icon} size={18} color={danger ? '#EF4444' : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? '#EF4444' : colors.foreground }]}>{label}</Text>
      {value && <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text>}
      {onPress && !danger && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }}
    >
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.primary,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
      }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Registered', value: registrations.length, icon: 'bookmark' },
          { label: 'Attended', value: attended, icon: 'check-circle' },
          { label: 'Certificates', value: certificates.length, icon: 'award' },
        ].map((stat, i) => (
          <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        {user?.studentId && <MenuItem icon="credit-card" label="Student ID" value={user.studentId} />}
        <MenuItem icon="book" label="Department" value={user?.department} />
        {user?.year && <MenuItem icon="layers" label="Year" value={user.year} />}
        {user?.phone && <MenuItem icon="phone" label="Phone" value={user.phone} />}
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACTIVITY</Text>
        <MenuItem icon="bookmark" label="My Events" onPress={() => router.push('/(student)/my-events')} />
        <MenuItem icon="award" label="Certificates" onPress={() => router.push('/certificates')} />
        <MenuItem icon="bell" label="Notifications" onPress={() => router.push('/notifications')} />
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon="log-out" label="Sign Out" onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20 },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontFamily: 'Inter_700Bold' },
  name: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsCard: { marginHorizontal: 20, marginTop: -20, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  menuSection: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  menuValue: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});

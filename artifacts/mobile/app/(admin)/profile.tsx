import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_USERS } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function AdminProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { events, registrations, certificates } = useEvents();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const Row = ({ icon, label, value, onPress, danger }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && onPress && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? '#EF444420' : colors.muted }]}>
        <Feather name={icon} size={18} color={danger ? '#EF4444' : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? '#EF4444' : colors.foreground }]}>{label}</Text>
      {value !== undefined && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
      {onPress && !danger && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }}
    >
      <View style={[styles.header, {
        backgroundColor: '#10B981',
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
          <Feather name="shield" size={12} color="#fff" />
          <Text style={styles.roleText}>ADMIN</Text>
        </View>
      </View>

      {/* Platform Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Total Users', value: MOCK_USERS.length },
          { label: 'Certificates', value: certificates.length },
        ].map((stat, i) => (
          <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SYSTEM INFO</Text>
        <Row icon="server" label="Platform" value="EventHub v1.0" />
        <Row icon="database" label="Events in System" value={events.length.toString()} />
        <Row icon="users" label="Registered Users" value={MOCK_USERS.length.toString()} />
        <Row icon="award" label="Certificates Issued" value={certificates.length.toString()} />
      </View>

      <View style={styles.section}>
        <Row icon="log-out" label="Sign Out" onPress={handleLogout} danger />
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
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});

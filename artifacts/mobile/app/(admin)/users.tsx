import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_USERS } from '../../constants/mockData';
import { UserRole } from '../../constants/types';
import { useColors } from '../../hooks/useColors';

const ROLE_COLORS: Record<UserRole, string> = {
  student: '#5B4FE8',
  faculty: '#2196F3',
  admin: '#10B981',
};

const ROLE_ICONS: Record<UserRole, string> = {
  student: 'user',
  faculty: 'user-check',
  admin: 'shield',
};

export default function AdminUsers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  const filtered = useMemo(() => {
    return MOCK_USERS.filter(u => {
      const matchRole = filterRole === 'all' || u.role === filterRole;
      const matchSearch = !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [search, filterRole]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, {
        backgroundColor: '#10B981',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSub}>{MOCK_USERS.length} total users</Text>

        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          {(['all', 'student', 'faculty', 'admin'] as const).map(role => (
            <Pressable
              key={role}
              onPress={() => setFilterRole(role)}
              style={[
                styles.filterChip,
                { backgroundColor: filterRole === role ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' },
              ]}
            >
              <Text style={[styles.filterText, { color: '#fff' }]}>
                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={u => u.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: u }) => {
          const roleColor = ROLE_COLORS[u.role];
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatarCircle, { backgroundColor: roleColor + '20' }]}>
                <Text style={[styles.avatarText, { color: roleColor }]}>
                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{u.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
                    <Feather name={ROLE_ICONS[u.role] as any} size={10} color={roleColor} />
                    <Text style={[styles.roleText, { color: roleColor }]}>{u.role}</Text>
                  </View>
                </View>
                <Text style={[styles.email, { color: colors.mutedForeground }]}>{u.email}</Text>
                <Text style={[styles.dept, { color: colors.mutedForeground }]}>{u.department}</Text>
              </View>
            </View>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, marginBottom: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  email: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  dept: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});

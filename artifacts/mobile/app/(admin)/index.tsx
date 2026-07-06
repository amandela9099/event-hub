import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';
import { MOCK_USERS } from '../../constants/mockData';

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { events, registrations, certificates, notifications } = useEvents();

  const stats = useMemo(() => ({
    totalEvents: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    totalRegistrations: registrations.length,
    totalAttended: registrations.filter(r => r.attended).length,
    certIssued: certificates.length,
    totalUsers: MOCK_USERS.length,
    students: MOCK_USERS.filter(u => u.role === 'student').length,
    faculty: MOCK_USERS.filter(u => u.role === 'faculty').length,
  }), [events, registrations, certificates]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    events.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + 1;
    });
    return Object.entries(breakdown).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);
  }, [events]);

  const CATEGORY_COLORS: Record<string, string> = {
    Technical: '#5B4FE8', Cultural: '#E91E8C', Sports: '#10B981',
    Workshop: '#F59E0B', Seminar: '#2196F3', Other: '#8E8FA3',
  };

  const recentActivity = useMemo(() => {
    return registrations.slice(-5).reverse().map(reg => {
      const event = events.find(e => e.id === reg.eventId);
      return { reg, event };
    }).filter(x => x.event);
  }, [registrations, events]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }}
    >
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: '#10B981',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
      }]}>
        <Text style={styles.headerLabel}>Admin Dashboard</Text>
        <Text style={styles.headerName}>{user?.name}</Text>
        <Text style={styles.headerSub}>System Overview</Text>
      </View>

      <View style={styles.content}>
        {/* Main Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
          <View style={styles.statsRow}>
            <StatCard label="Total Events" value={stats.totalEvents} icon="calendar" color="#5B4FE8" />
            <StatCard label="Total Users" value={stats.totalUsers} icon="users" color="#2196F3" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Registrations" value={stats.totalRegistrations} icon="bookmark" color="#F59E0B" />
            <StatCard label="Certificates" value={stats.certIssued} icon="award" color="#10B981" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Students" value={stats.students} icon="user" color="#E91E8C" />
            <StatCard label="Faculty" value={stats.faculty} icon="user-check" color="#6366F1" />
          </View>
        </View>

        {/* Attendance Rate */}
        <View style={[styles.rateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.rateTitle, { color: colors.foreground }]}>Attendance Rate</Text>
          <View style={styles.rateRow}>
            <Text style={[styles.rateValue, { color: '#10B981' }]}>
              {stats.totalRegistrations > 0
                ? `${Math.round((stats.totalAttended / stats.totalRegistrations) * 100)}%`
                : '0%'
              }
            </Text>
            <Text style={[styles.rateSub, { color: colors.mutedForeground }]}>
              {stats.totalAttended}/{stats.totalRegistrations} attended
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, {
              width: `${stats.totalRegistrations > 0 ? Math.round((stats.totalAttended / stats.totalRegistrations) * 100) : 0}%` as any,
              backgroundColor: '#10B981',
            }]} />
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Events by Category</Text>
          <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {categoryBreakdown.map(({ cat, count }) => {
              const pct = Math.round((count / stats.totalEvents) * 100);
              const catColor = CATEGORY_COLORS[cat] || colors.primary;
              return (
                <View key={cat} style={styles.breakdownRow}>
                  <View style={[styles.breakdownDot, { backgroundColor: catColor }]} />
                  <Text style={[styles.breakdownCat, { color: colors.foreground }]}>{cat}</Text>
                  <View style={[styles.miniBar, { backgroundColor: colors.muted }]}>
                    <View style={[styles.miniBarFill, { width: `${pct}%` as any, backgroundColor: catColor }]} />
                  </View>
                  <Text style={[styles.breakdownCount, { color: colors.mutedForeground }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Registrations</Text>
          {recentActivity.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="activity" size={24} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
            </View>
          ) : (
            recentActivity.map(({ reg, event }) => (
              <View key={reg.id} style={[styles.activityRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Feather name="user-plus" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {event!.title}
                  </Text>
                  <Text style={[styles.activitySub, { color: colors.mutedForeground }]}>
                    Registration #{reg.id.slice(-6).toUpperCase()}
                  </Text>
                </View>
                {reg.attended && (
                  <Feather name="check-circle" size={16} color="#10B981" />
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular' },
  headerName: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 2 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  content: { padding: 20 },
  statsSection: { marginBottom: 20, gap: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 14 },
  rateCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 10 },
  rateTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  rateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  rateValue: { fontSize: 36, fontFamily: 'Inter_700Bold' },
  rateSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 24 },
  breakdownCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownCat: { width: 80, fontSize: 13, fontFamily: 'Inter_500Medium' },
  miniBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },
  breakdownCount: { width: 24, fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  activitySub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  emptyCard: { alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});

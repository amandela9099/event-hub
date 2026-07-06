import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { NotificationItem } from '../components/NotificationItem';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { useColors } from '../hooks/useColors';

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getUserNotifications, markNotificationRead } = useEvents();
  const notifications = user ? getUserNotifications(user.id) : [];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, {
        backgroundColor: colors.primary,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 && <Text style={styles.headerSub}>{unread} unread</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => markNotificationRead(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No notifications"
            subtitle="Notifications about your registrations and events will appear here"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  list: { padding: 16 },
});

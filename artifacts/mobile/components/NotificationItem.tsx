import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppNotification } from '../constants/types';
import { useColors } from '../hooks/useColors';

const TYPE_ICONS: Record<string, string> = {
  registration: 'check-circle',
  reminder: 'clock',
  certificate: 'award',
  announcement: 'bell',
  update: 'refresh-cw',
};

const TYPE_COLORS: Record<string, string> = {
  registration: '#10B981',
  reminder: '#F59E0B',
  certificate: '#5B4FE8',
  announcement: '#2196F3',
  update: '#E91E8C',
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const colors = useColors();
  const iconColor = TYPE_COLORS[notification.type] || colors.primary;
  const time = new Date(notification.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: notification.read ? colors.card : colors.secondary, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '20' }]}>
        <Feather name={TYPE_ICONS[notification.type] as any} size={20} color={iconColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{time}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 14, fontFamily: 'Inter_600SemiBold', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  message: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  time: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});

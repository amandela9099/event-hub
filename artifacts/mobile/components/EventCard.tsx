import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Event } from '../constants/types';
import { useColors } from '../hooks/useColors';

interface EventCardProps {
  event: Event;
  compact?: boolean;
  registered?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Technical: '#5B4FE8',
  Cultural: '#E91E8C',
  Sports: '#10B981',
  Workshop: '#F59E0B',
  Seminar: '#2196F3',
  Other: '#8E8FA3',
};

export function EventCard({ event, compact, registered }: EventCardProps) {
  const colors = useColors();
  const fillPct = Math.round((event.registered / event.capacity) * 100);
  const isFull = event.registered >= event.capacity;
  const catColor = CATEGORY_COLORS[event.category] || colors.primary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/event/${event.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
      ]}
    >
      {!compact && (
        <View style={[styles.imageContainer, { backgroundColor: colors.muted }]}>
          {event.image ? (
            <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: catColor + '20' }]}>
              <Feather
                name={event.category === 'Sports' ? 'award' : event.category === 'Cultural' ? 'music' : 'zap'}
                size={32}
                color={catColor}
              />
            </View>
          )}
          <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          {registered && (
            <View style={[styles.registeredBadge, { backgroundColor: colors.success }]}>
              <Feather name="check-circle" size={12} color="#fff" />
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          {compact && (
            <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
          )}
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {event.title}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.time}</Text>
          </View>
        </View>

        <View style={styles.metaItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>

        {!compact && (
          <View style={styles.footer}>
            <View style={styles.capacityContainer}>
              <View style={[styles.capacityBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.capacityFill, {
                  width: `${fillPct}%` as any,
                  backgroundColor: isFull ? colors.destructive : colors.primary,
                }]} />
              </View>
              <Text style={[styles.capacityText, { color: colors.mutedForeground }]}>
                {isFull ? 'Full' : `${event.registered}/${event.capacity}`}
              </Text>
            </View>
            {event.hasCertificate && (
              <View style={[styles.certBadge, { backgroundColor: colors.secondary }]}>
                <Feather name="award" size={10} color={colors.primary} />
                <Text style={[styles.certText, { color: colors.primary }]}>Certificate</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#5B4FE8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  imageContainer: { height: 140, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  categoryBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  registeredBadge: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  registeredText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  capacityContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  capacityBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  capacityFill: { height: '100%', borderRadius: 2 },
  capacityText: { fontSize: 11, fontFamily: 'Inter_500Medium', width: 50 },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  certText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});

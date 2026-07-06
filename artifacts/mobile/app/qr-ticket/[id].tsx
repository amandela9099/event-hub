import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QRDisplay } from '../../components/QRDisplay';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

export default function QRTicketScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { registrations, events } = useEvents();

  const registration = registrations.find(r => r.id === id);
  const event = registration ? events.find(e => e.id === registration.eventId) : null;

  if (!registration || !event) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Ticket not found</Text>
      </View>
    );
  }

  const regDate = new Date(registration.registeredAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.primary,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>QR Ticket</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ticket Card */}
        <View style={[styles.ticket, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Top ribbon */}
          <View style={[styles.ticketHeader, { backgroundColor: colors.primary }]}>
            <Feather name="calendar" size={20} color="#fff" />
            <Text style={styles.ticketEventTitle} numberOfLines={2}>{event.title}</Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            <Text style={[styles.scanLabel, { color: colors.mutedForeground }]}>
              Show this QR code at the event entrance
            </Text>
            <QRDisplay value={registration.qrCode} size={220} />
          </View>

          {/* Ticket perforation */}
          <View style={styles.perforation}>
            <View style={[styles.perforationCircle, { backgroundColor: colors.background }]} />
            <View style={[styles.dashedLine, { borderColor: colors.border }]} />
            <View style={[styles.perforationCircle, { backgroundColor: colors.background }]} />
          </View>

          {/* Event Details */}
          <View style={styles.ticketDetails}>
            {[
              { icon: 'user', label: 'Attendee', value: user?.name },
              { icon: 'calendar', label: 'Event Date', value: event.date },
              { icon: 'clock', label: 'Time', value: event.time },
              { icon: 'map-pin', label: 'Venue', value: event.venue },
              { icon: 'tag', label: 'Category', value: event.category },
              { icon: 'hash', label: 'Ticket ID', value: registration.id.slice(-10).toUpperCase() },
              { icon: 'check-circle', label: 'Registered On', value: regDate },
            ].map(item => (
              <View key={item.label} style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={item.icon as any} size={14} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {registration.attended && (
            <View style={[styles.attendedBanner, { backgroundColor: colors.success + '20' }]}>
              <Feather name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.attendedText, { color: colors.success }]}>Attendance Confirmed</Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => [
            styles.shareBtn,
            { backgroundColor: colors.secondary, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Feather name="share-2" size={18} color={colors.primary} />
          <Text style={[styles.shareBtnText, { color: colors.primary }]}>Share Ticket</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { padding: 20, paddingBottom: 40 },
  ticket: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  ticketHeader: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticketEventTitle: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  qrSection: { alignItems: 'center', padding: 24, gap: 12 },
  scanLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  perforation: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 },
  perforationCircle: { width: 24, height: 24, borderRadius: 12 },
  dashedLine: { flex: 1, borderTopWidth: 2, borderStyle: 'dashed' },
  ticketDetails: { padding: 20, gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  attendedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, padding: 12, borderRadius: 12 },
  attendedText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  shareBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});

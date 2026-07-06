import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Certificate } from '../constants/types';
import { useColors } from '../hooks/useColors';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const colors = useColors();
  const issued = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.ribbon, { backgroundColor: colors.primary }]}>
        <Feather name="award" size={20} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>CERTIFICATE OF PARTICIPATION</Text>
        <Text style={[styles.name, { color: colors.foreground }]}>{certificate.userName}</Text>
        <Text style={[styles.event, { color: colors.primary }]} numberOfLines={2}>{certificate.eventTitle}</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather name="hash" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {certificate.certificateNumber}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{issued}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.stamp, { borderColor: colors.primary + '40' }]}>
        <Text style={[styles.stampText, { color: colors.primary + '40' }]}>VERIFIED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, marginBottom: 12,
    overflow: 'hidden', position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#5B4FE8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  ribbon: { height: 6 },
  content: { padding: 20 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 8 },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  event: { fontSize: 15, fontFamily: 'Inter_500Medium', marginBottom: 16 },
  divider: { height: 1, marginBottom: 12 },
  meta: { gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  stamp: {
    position: 'absolute', bottom: 16, right: 16,
    borderWidth: 2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    transform: [{ rotate: '-15deg' }],
  },
  stampText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 2 },
});

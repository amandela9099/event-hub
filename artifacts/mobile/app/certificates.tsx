import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CertificateCard } from '../components/CertificateCard';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { useColors } from '../hooks/useColors';

export default function CertificatesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getUserCertificates } = useEvents();
  const certificates = user ? getUserCertificates(user.id) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, {
        backgroundColor: colors.primary,
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Certificates</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'web' ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {certificates.length === 0 ? (
          <EmptyState
            icon="award"
            title="No certificates yet"
            subtitle="Attend events to earn certificates of participation"
          />
        ) : (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.secondary }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
              </Text>
            </View>
            {certificates.map(cert => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { padding: 20 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },
  infoText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});

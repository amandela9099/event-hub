import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../hooks/useColors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  small?: boolean;
}

export function StatCard({ label, value, icon, color, small }: StatCardProps) {
  const colors = useColors();
  const accentColor = color || colors.primary;

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.card, borderColor: colors.border },
      small && styles.cardSmall,
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '18' }]}>
        <Feather name={icon as any} size={small ? 18 : 22} color={accentColor} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }, small && styles.valueSmall]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground }, small && styles.labelSmall]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    ...Platform.select({
      ios: { shadowColor: '#5B4FE8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardSmall: { padding: 12, gap: 4 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  valueSmall: { fontSize: 18 },
  label: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  labelSmall: { fontSize: 11 },
});

import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../hooks/useColors';

interface QRDisplayProps {
  value: string;
  size?: number;
}

// Visual QR code simulation using a grid pattern
function QRPattern({ size, dark }: { size: number; dark: boolean }) {
  const cell = size / 21;
  // QR-like pattern using SVG-style boxes
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
    [1,1,0,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,0],
    [0,1,0,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1],
    [1,0,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,0,1],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,1,0,0,1,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,0,0,1,0,1,0,1,1,0],
  ];

  return (
    <View style={{ width: size, height: size }}>
      {pattern.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((cell_val, ci) => (
            <View key={ci} style={{
              width: cell,
              height: cell,
              backgroundColor: cell_val ? (dark ? '#F0EEFF' : '#1a1a2e') : 'transparent',
            }} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function QRDisplay({ value, size = 200 }: QRDisplayProps) {
  const colors = useColors();
  const isDark = colors.background === '#0F0F23';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1A1A35' : '#FFFFFF' }]}>
      <QRPattern size={size} dark={isDark} />
      <View style={[styles.idContainer, { backgroundColor: colors.muted }]}>
        <Feather name="hash" size={12} color={colors.mutedForeground} />
        <Text style={[styles.idText, { color: colors.mutedForeground }]} numberOfLines={1}>
          {value.slice(-20)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, borderRadius: 16, gap: 12 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  idText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});

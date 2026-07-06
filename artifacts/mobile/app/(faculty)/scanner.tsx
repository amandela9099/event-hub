import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../../context/EventsContext';
import { useColors } from '../../hooks/useColors';

type ScanResult = { success: boolean; message: string } | null;

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { markAttendance } = useEvents();
  const [manualCode, setManualCode] = useState('');
  const [lastResult, setLastResult] = useState<ScanResult>(null);
  const [isScanning, setIsScanning] = useState(false);

  const processCode = async (code: string) => {
    if (!code.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await markAttendance(code.trim());
    setLastResult(result);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setManualCode('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: '#2196F3',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
      }]}>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <Text style={styles.headerSub}>Scan attendee tickets to mark attendance</Text>
      </View>

      {/* Scanner Viewfinder Visual */}
      <View style={styles.scannerArea}>
        <View style={[styles.scannerFrame, { borderColor: '#2196F3' }]}>
          <View style={[styles.corner, styles.topLeft, { borderColor: '#2196F3' }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: '#2196F3' }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: '#2196F3' }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: '#2196F3' }]} />

          <View style={styles.scannerContent}>
            <View style={[styles.scanIcon, { backgroundColor: '#2196F320' }]}>
              <Feather name="maximize" size={64} color="#2196F3" />
            </View>
            <Text style={[styles.scannerLabel, { color: colors.foreground }]}>
              {Platform.OS === 'web'
                ? 'Camera not available on web'
                : 'Point camera at QR code'}
            </Text>
            <Text style={[styles.scannerSub, { color: colors.mutedForeground }]}>
              Use manual entry below to mark attendance
            </Text>
          </View>
        </View>
      </View>

      {/* Result Banner */}
      {lastResult && (
        <View style={[styles.resultBanner, {
          backgroundColor: lastResult.success ? '#10B98120' : '#EF444420',
          borderColor: lastResult.success ? '#10B981' : '#EF4444',
        }]}>
          <Feather
            name={lastResult.success ? 'check-circle' : 'x-circle'}
            size={20}
            color={lastResult.success ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.resultText, { color: lastResult.success ? '#10B981' : '#EF4444' }]}>
            {lastResult.message}
          </Text>
          <Pressable onPress={() => setLastResult(null)}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      )}

      {/* Manual Entry */}
      <View style={[styles.manualSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Text style={[styles.manualTitle, { color: colors.foreground }]}>Manual Entry</Text>
        <Text style={[styles.manualSub, { color: colors.mutedForeground }]}>
          Enter the QR code value from the ticket
        </Text>
        <View style={styles.manualInput}>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="hash" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Paste or type ticket code..."
              placeholderTextColor={colors.mutedForeground}
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Pressable
            onPress={() => processCode(manualCode)}
            disabled={!manualCode.trim()}
            style={({ pressed }) => [
              styles.processBtn,
              { backgroundColor: manualCode.trim() ? '#2196F3' : colors.muted },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="check" size={20} color={manualCode.trim() ? '#fff' : colors.mutedForeground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  scannerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  scannerFrame: { width: '100%', aspectRatio: 1, borderWidth: 2, borderRadius: 20, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 30, height: 30, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 12 },
  scannerContent: { alignItems: 'center', gap: 12, padding: 20 },
  scanIcon: { width: 100, height: 100, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scannerLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  scannerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  resultBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 14, borderRadius: 14, borderWidth: 1 },
  resultText: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  manualSection: { padding: 20, borderTopWidth: 1, paddingBottom: Platform.OS === 'web' ? 54 : 20 },
  manualTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  manualSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  manualInput: { flexDirection: 'row', gap: 10 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  processBtn: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

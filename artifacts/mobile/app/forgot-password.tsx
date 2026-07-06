import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, {
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
        paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20),
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        {sent ? (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <Feather name="mail" size={48} color={colors.success} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Email Sent!</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Password reset instructions have been sent to {email}
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={[styles.btn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.btnText}>Back to Login</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
              <Feather name="lock" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Forgot Password?</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Enter your email and we'll send you reset instructions.
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Email address"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Pressable
              onPress={handleSend}
              style={({ pressed }) => [styles.btn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.btnText}>Send Reset Link</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  backBtn: { marginBottom: 32 },
  iconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 32 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  btn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  success: { color: '#10B981' },
});

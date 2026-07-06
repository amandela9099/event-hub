import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEMO_CREDENTIALS } from '../constants/mockData';
import { UserRole } from '../constants/types';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('student');

  const handleDemoLogin = (role: UserRole) => {
    const cred = DEMO_CREDENTIALS.find(c => c.role === role);
    if (cred) {
      setEmail(cred.email);
      setActiveRole(role);
      setPassword('demo123');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    }
  };

  const ROLE_COLORS: Record<UserRole, string> = {
    student: '#5B4FE8',
    faculty: '#2196F3',
    admin: '#10B981',
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, {
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0),
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20),
        }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Feather name="calendar" size={36} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>EventHub</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            College Event Management Platform
          </Text>
        </View>

        {/* Demo Role Picker */}
        <View style={[styles.demoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.demoLabel, { color: colors.mutedForeground }]}>Quick login as:</Text>
          <View style={styles.roleRow}>
            {DEMO_CREDENTIALS.map(cred => (
              <Pressable
                key={cred.role}
                onPress={() => handleDemoLogin(cred.role)}
                style={({ pressed }) => [
                  styles.roleBtn,
                  {
                    backgroundColor: activeRole === cred.role
                      ? ROLE_COLORS[cred.role] + '20'
                      : colors.muted,
                    borderColor: activeRole === cred.role
                      ? ROLE_COLORS[cred.role]
                      : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather
                  name={cred.role === 'admin' ? 'shield' : cred.role === 'faculty' ? 'user-check' : 'user'}
                  size={16}
                  color={activeRole === cred.role ? ROLE_COLORS[cred.role] : colors.mutedForeground}
                />
                <Text style={[
                  styles.roleBtnText,
                  { color: activeRole === cred.role ? ROLE_COLORS[cred.role] : colors.mutedForeground },
                ]}>
                  {cred.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(p => !p)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/forgot-password')}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
              isLoading && { opacity: 0.7 },
            ]}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Register</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', gap: 12, marginBottom: 32 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 36, fontFamily: 'Inter_700Bold' },
  tagline: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  demoBox: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24, gap: 12 },
  demoLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 12, borderWidth: 1.5 },
  roleBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  form: { gap: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  loginBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  loginBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

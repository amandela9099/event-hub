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
import { UserRole } from '../constants/types';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../hooks/useColors';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ROLES: { value: UserRole; label: string; icon: string }[] = [
    { value: 'student', label: 'Student', icon: 'user' },
    { value: 'faculty', label: 'Faculty', icon: 'user-check' },
  ];

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !department.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    const result = await register({ name, email, password, department, role, studentId });
    setIsLoading(false);
    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const Field = ({ label, icon, value, onChange, placeholder, keyboardType, secure, showToggle }: any) => (
    <View>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={icon} size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          autoCorrect={false}
          secureTextEntry={secure && !showPassword}
        />
        {showToggle && (
          <Pressable onPress={() => setShowPassword(p => !p)}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, {
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20),
        }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Join EventHub to access college events
        </Text>

        <View style={[styles.roleSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ROLES.map(r => (
            <Pressable
              key={r.value}
              onPress={() => setRole(r.value)}
              style={({ pressed }) => [
                styles.roleOption,
                { backgroundColor: role === r.value ? colors.primary : 'transparent' },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name={r.icon as any} size={16} color={role === r.value ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.roleText, { color: role === r.value ? '#fff' : colors.mutedForeground }]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.form}>
          <Field label="Full Name *" icon="user" value={name} onChange={setName} placeholder="Your full name" />
          <Field label="Email Address *" icon="mail" value={email} onChange={setEmail} placeholder="your@email.com" keyboardType="email-address" />
          <Field label="Password *" icon="lock" value={password} onChange={setPassword} placeholder="Min 6 characters" secure showToggle />
          <Field label="Department *" icon="book" value={department} onChange={setDepartment} placeholder="e.g. Computer Science" />
          {role === 'student' && (
            <Field label="Student ID" icon="credit-card" value={studentId} onChange={setStudentId} placeholder="e.g. CS2024001" />
          )}
        </View>

        <Pressable
          onPress={handleRegister}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.registerBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
            isLoading && { opacity: 0.7 },
          ]}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.registerBtnText}>Create Account</Text>
          }
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  roleSelector: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, gap: 4, marginBottom: 24 },
  roleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  roleText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  form: { gap: 16, marginBottom: 24 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  registerBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  registerBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MOCK_USERS } from '../constants/mockData';
import { User, UserRole } from '../constants/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (data: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = '@eventhub_user';
const USERS_KEY = '@eventhub_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const customUsers: User[] = stored ? JSON.parse(stored) : [];
      return [...MOCK_USERS, ...customUsers];
    } catch {
      return MOCK_USERS;
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const users = await getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Invalid email or password' };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    setUser(found);
    return { success: true, role: found.role };
  }, []);

  const register = useCallback(async (data: Partial<User> & { password: string }) => {
    const users = await getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email?.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      password: data.password,
      role: (data.role as UserRole) || 'student',
      department: data.department || '',
      joinedAt: new Date().toISOString().split('T')[0],
      studentId: data.studentId,
      year: data.year,
      phone: data.phone,
    };
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const customUsers: User[] = stored ? JSON.parse(stored) : [];
    customUsers.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(customUsers));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ─── Configuration ──────────────────────────────────────────────
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://tbbcpyxgbqoriemhhxar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYmNweXhnYnFvcmllbWhoeGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjA4MDksImV4cCI6MjA5MTMzNjgwOX0.gunylXVxg2dwpOBsxgVnxdAK4n7WZNpCVlm0bd7ZSoI';

// ─── Secure token storage adapter ────────────────────────────────
// Uses expo-secure-store on native, falls back to in-memory on web
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return null;
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail on secure store errors
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

// ─── Supabase client ────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Auth functions ─────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw error;
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });
  return () => subscription.unsubscribe();
}

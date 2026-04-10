import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUp } from '../services/supabase';
import { LanguageToggle } from '../components/ui';
import { colors, typography, spacing } from '../theme';

interface RegisterScreenProps {
  onNavigateLogin: () => void;
  onRegistered: (email: string) => void;
}

export function RegisterScreen({ onNavigateLogin, onRegistered }: RegisterScreenProps) {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signUp(email.trim(), password);
      onRegistered(email.trim());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('already registered')) {
        setError(t('auth.emailAlreadyUsed'));
      } else {
        setError(message || t('auth.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.langToggle}>
          <LanguageToggle />
        </View>

        <View style={styles.header}>
          <Text style={styles.appName}>AERIAL ANATOMY</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
            />
          </View>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg.primary} />
            ) : (
              <Text style={styles.btnText}>{t('auth.createAccount')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onNavigateLogin} style={styles.linkBtn}>
            <Text style={styles.linkText}>{t('auth.haveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  langToggle: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 6,
    color: colors.accent.primary,
    fontFamily: typography.heading.fontFamily,
  },
  form: {
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 48,
  },
  error: {
    ...typography.body.small,
    color: colors.safety.critical,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: colors.bg.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    ...typography.body.regular,
    color: colors.accent.primary,
  },
});

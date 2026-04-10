import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { signIn, resendVerificationEmail } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';
import { colors, typography, spacing } from '../theme';

interface VerifyEmailScreenProps {
  email: string;
  password?: string;
  onBackToLogin: () => void;
}

export function VerifyEmailScreen({ email, password, onBackToLogin }: VerifyEmailScreenProps) {
  const { t } = useTranslation();
  const setUserId = useAppStore((s) => s.setUserId);
  const setIsAuthenticated = useAppStore((s) => s.setIsAuthenticated);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerified = async () => {
    if (!password) {
      onBackToLogin();
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const data = await signIn(email, password);
      if (data.user) {
        setUserId(data.user.id);
        setIsAuthenticated(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('Email not confirmed')) {
        setMessage(t('auth.emailStillNotVerified'));
      } else {
        setMessage(message || t('auth.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      await resendVerificationEmail(email);
      setMessage(t('auth.verificationResent'));
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : t('auth.genericError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="email-check-outline" size={64} color={colors.accent.primary} />

        <Text style={styles.title}>{t('auth.checkEmail')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.verificationSent', { email })}
        </Text>

        {message !== '' && (
          <Text style={styles.message}>{message}</Text>
        )}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleVerified}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg.primary} />
          ) : (
            <Text style={styles.btnText}>{t('auth.alreadyVerified')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, resending && styles.btnDisabled]}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={colors.accent.primary} size="small" />
          ) : (
            <Text style={styles.secondaryBtnText}>{t('auth.resendEmail')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onBackToLogin} style={styles.linkBtn}>
          <Text style={styles.linkText}>{t('auth.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  message: {
    ...typography.body.small,
    color: colors.accent.muted,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: colors.bg.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  secondaryBtnText: {
    color: colors.accent.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  linkBtn: {
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../../store/useAppStore';
import { getFeatureFlags } from '../../services/paywall';
import { colors, typography, spacing } from '../../theme';

type ViewMode = '2d' | '3d';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
  bodyView: 'front' | 'back';
  onChangeBodyView: (view: 'front' | 'back') => void;
}

export function ViewModeToggle({
  viewMode,
  onChangeMode,
  bodyView,
  onChangeBodyView,
}: ViewModeToggleProps) {
  const { t } = useTranslation();
  const subscription = useAppStore((s) => s.subscription);
  const flags = getFeatureFlags(subscription);
  const can3D = flags.anatomy3DViewer;

  return (
    <View style={styles.container}>
      {/* 2D/3D toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          onPress={() => onChangeMode('2d')}
          style={[styles.modeBtn, viewMode === '2d' && styles.modeBtnActive]}
        >
          <Text style={[styles.modeBtnText, viewMode === '2d' && styles.modeBtnTextActive]}>
            {t('body.viewMode2D')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (can3D) {
              onChangeMode('3d');
            }
          }}
          style={[styles.modeBtn, viewMode === '3d' && styles.modeBtnActive]}
        >
          <View style={styles.modeBtnContent}>
            <Text style={[styles.modeBtnText, viewMode === '3d' && styles.modeBtnTextActive]}>
              {t('body.viewMode3D')}
            </Text>
            {!can3D && (
              <MaterialCommunityIcons name="lock" size={12} color={colors.text.muted} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Front/Back toggle (only in 2D mode) */}
      {viewMode === '2d' && (
        <View style={styles.bodyToggle}>
          <TouchableOpacity
            onPress={() => onChangeBodyView('front')}
            style={[styles.bodyBtn, bodyView === 'front' && styles.bodyBtnActive]}
          >
            <Text style={[styles.bodyBtnText, bodyView === 'front' && styles.bodyBtnTextActive]}>
              {t('body.front')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChangeBodyView('back')}
            style={[styles.bodyBtn, bodyView === 'back' && styles.bodyBtnActive]}
          >
            <Text style={[styles.bodyBtnText, bodyView === 'back' && styles.bodyBtnTextActive]}>
              {t('body.back')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  modeBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.accent.primary,
  },
  modeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeBtnText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: colors.bg.primary,
  },
  bodyToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  bodyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  bodyBtnActive: {
    backgroundColor: colors.accent.secondary,
  },
  bodyBtnText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontWeight: '600',
  },
  bodyBtnTextActive: {
    color: colors.bg.primary,
  },
});

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, BackHandler, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { muscles } from '../../data/muscles';
import { movements } from '../../data/movements';
import { colors, typography, spacing } from '../../theme';

interface GlobalSearchProps {
  onSelectMuscle: (muscleId: string) => void;
  onSelectMovement: (movementId: string) => void;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'muscle' | 'movement';
  name: string;
  subtitle: string;
}

export function GlobalSearch({ onSelectMuscle, onSelectMovement, onClose }: GlobalSearchProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const [query, setQuery] = useState('');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const results = useMemo((): SearchResult[] => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();

    const muscleResults: SearchResult[] = muscles
      .filter((m) => {
        const name = lang === 'es' ? m.name_es : m.name_en;
        return (
          name.toLowerCase().includes(q) ||
          m.name_latin.toLowerCase().includes(q)
        );
      })
      .slice(0, 8)
      .map((m) => ({
        id: m.id,
        type: 'muscle',
        name: lang === 'es' ? m.name_es : m.name_en,
        subtitle: m.name_latin,
      }));

    const movementResults: SearchResult[] = movements
      .filter((mv) => {
        const name = lang === 'es' ? mv.name_es : mv.name_en;
        return name.toLowerCase().includes(q);
      })
      .slice(0, 8)
      .map((mv) => ({
        id: mv.id,
        type: 'movement',
        name: lang === 'es' ? mv.name_es : mv.name_en,
        subtitle: mv.level,
      }));

    return [...muscleResults, ...movementResults];
  }, [query, lang]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === 'muscle') {
      onSelectMuscle(item.id);
    } else {
      onSelectMovement(item.id);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.text.muted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.text.muted}
            autoFocus
            autoCorrect={false}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <MaterialCommunityIcons
                  name={item.type === 'muscle' ? 'arm-flex' : 'run'}
                  size={18}
                  color={item.type === 'muscle' ? colors.muscle.agonista : colors.accent.primary}
                />
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSub}>{item.subtitle}</Text>
                </View>
                <View style={[styles.typeBadge, item.type === 'muscle' ? styles.muscleBadge : styles.movementBadge]}>
                  <Text style={styles.typeText}>
                    {item.type === 'muscle'
                      ? t('search.muscle')
                      : t('search.movement')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {query.length >= 2 && results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {t('search.noResults')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
  },
  container: {
    marginTop: 60,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: 400,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 340,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    minHeight: 52,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    ...typography.body.regular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  resultSub: {
    ...typography.body.small,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  muscleBadge: {
    backgroundColor: colors.muscle.agonista + '20',
  },
  movementBadge: {
    backgroundColor: colors.accent.primary + '20',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
});

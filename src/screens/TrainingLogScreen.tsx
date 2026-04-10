import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { movements } from '../data/movements';
import { useAppStore, TrainingEntry } from '../store/useAppStore';
import { colors, typography, spacing } from '../theme';

type ScreenMode = 'list' | 'new';

export function TrainingLogScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation<any>();
  const trainingLog = useAppStore((s) => s.trainingLog);
  const addEntry = useAppStore((s) => s.addTrainingEntry);

  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);

  const stats = useMemo(() => {
    if (trainingLog.length === 0) return null;
    const avg = trainingLog.reduce((sum, e) => sum + e.rating, 0) / trainingLog.length;
    return { total: trainingLog.length, avg: avg.toFixed(1) };
  }, [trainingLog]);

  const toggleMovement = (id: string) => {
    setSelectedMovements((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const entry: TrainingEntry = {
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      movementIds: selectedMovements,
      notes: notes.trim(),
      duration: parseInt(duration, 10) || 0,
      rating,
    };
    addEntry(entry);
    setMode('list');
    setSelectedMovements([]);
    setNotes('');
    setDuration('');
    setRating(3);
  };

  // ── NEW ENTRY ──
  if (mode === 'new') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setMode('list')} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('training.log')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>{t('training.newEntry')}</Text>

          {/* Movement Selection */}
          <Text style={styles.label}>{t('training.movements')}</Text>
          <View style={styles.movementGrid}>
            {movements.slice(0, 20).map((mv) => {
              const isSelected = selectedMovements.includes(mv.id);
              return (
                <TouchableOpacity
                  key={mv.id}
                  style={[styles.mvChip, isSelected && styles.mvChipActive]}
                  onPress={() => toggleMovement(mv.id)}
                >
                  <Text style={[styles.mvChipText, isSelected && styles.mvChipTextActive]}>
                    {lang === 'es' ? mv.name_es : mv.name_en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Duration */}
          <Text style={styles.label}>{t('training.duration')}</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="60"
            placeholderTextColor={colors.text.muted}
          />

          {/* Rating */}
          <Text style={styles.label}>{t('training.rating')}</Text>
          <View style={styles.ratingRow}>
            {([1, 2, 3, 4, 5] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.ratingBtn, rating === r && styles.ratingBtnActive]}
                onPress={() => setRating(r)}
              >
                <MaterialCommunityIcons
                  name={r <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={r <= rating ? colors.accent.primary : colors.text.muted}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Text style={styles.label}>{t('training.notes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            placeholder="..."
            placeholderTextColor={colors.text.muted}
          />

          <TouchableOpacity
            style={[styles.saveBtn, selectedMovements.length === 0 && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={selectedMovements.length === 0}
          >
            <Text style={styles.saveBtnText}>{t('training.save')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── LIST ──
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{t('training.log')}</Text>

        {stats && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>{t('training.totalSessions', { count: stats.total })}</Text>
            <Text style={styles.statsText}>{t('training.avgRating', { avg: stats.avg })}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.newEntryBtn} onPress={() => setMode('new')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.accent.primary} />
          <Text style={styles.newEntryText}>{t('training.newEntry')}</Text>
        </TouchableOpacity>

        {trainingLog.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="notebook-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>{t('training.noEntries')}</Text>
            <Text style={styles.emptyHint}>{t('training.noEntriesHint')}</Text>
          </View>
        ) : (
          <View style={styles.entries}>
            {trainingLog.map((entry) => (
              <EntryCard key={entry.id} entry={entry} lang={lang} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EntryCard({ entry, lang }: { entry: TrainingEntry; lang: 'es' | 'en' }) {
  const mvNames = entry.movementIds
    .map((id) => {
      const mv = movements.find((m) => m.id === id);
      return mv ? (lang === 'es' ? mv.name_es : mv.name_en) : '';
    })
    .filter(Boolean);

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{entry.date}</Text>
        <View style={styles.entryStars}>
          {[1, 2, 3, 4, 5].map((r) => (
            <MaterialCommunityIcons
              key={r}
              name={r <= entry.rating ? 'star' : 'star-outline'}
              size={14}
              color={r <= entry.rating ? colors.accent.primary : colors.text.muted}
            />
          ))}
        </View>
      </View>
      {entry.duration > 0 && (
        <Text style={styles.entryDuration}>{entry.duration} min</Text>
      )}
      <Text style={styles.entryMovements} numberOfLines={2}>
        {mvNames.join(', ')}
      </Text>
      {entry.notes ? (
        <Text style={styles.entryNotes} numberOfLines={3}>{entry.notes}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  backText: {
    ...typography.body.regular,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  screenTitle: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    padding: spacing.md,
  },
  statsText: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  newEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.accent.primary}10`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    padding: spacing.lg,
    minHeight: 48,
  },
  newEntryText: {
    ...typography.body.regular,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.heading.h3,
    fontFamily: typography.heading.fontFamily,
    color: colors.text.secondary,
  },
  emptyHint: {
    ...typography.body.regular,
    color: colors.text.muted,
  },
  entries: {
    gap: spacing.md,
  },
  entryCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    ...typography.body.regular,
    color: colors.accent.light,
    fontWeight: '600',
  },
  entryStars: {
    flexDirection: 'row',
    gap: 2,
  },
  entryDuration: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  entryMovements: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  entryNotes: {
    ...typography.body.small,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  // ── New Entry Form ──
  formContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  formTitle: {
    ...typography.heading.h2,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  label: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 11,
  },
  movementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mvChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 30,
    justifyContent: 'center',
  },
  mvChipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  mvChipText: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
  },
  mvChipTextActive: {
    color: colors.bg.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    ...typography.body.regular,
  },
  textArea: {
    minHeight: 80,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingBtn: {
    padding: spacing.xs,
  },
  ratingBtnActive: {
    // visual via icon color
  },
  saveBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    ...typography.body.regular,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});

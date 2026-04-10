import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppStore } from '../../store/useAppStore';
import { colors, typography, spacing } from '../../theme';

interface InstructorNotesProps {
  movementId: string;
}

export function InstructorNotes({ movementId }: InstructorNotesProps) {
  const { t } = useTranslation();
  const note = useAppStore((s) => s.instructorNotes[movementId] ?? '');
  const setNote = useAppStore((s) => s.setInstructorNote);
  const deleteNote = useAppStore((s) => s.deleteInstructorNote);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      setNote(movementId, trimmed);
    } else {
      deleteNote(movementId);
    }
    setEditing(false);
  };

  const handleEdit = () => {
    setDraft(note);
    setEditing(true);
  };

  if (!editing && !note) {
    return (
      <TouchableOpacity style={styles.addBtn} onPress={handleEdit} activeOpacity={0.7}>
        <MaterialCommunityIcons name="note-plus-outline" size={18} color={colors.accent.primary} />
        <Text style={styles.addText}>{t('instructor.addNote')}</Text>
      </TouchableOpacity>
    );
  }

  if (editing) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{t('instructor.notes')}</Text>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={t('instructor.notePlaceholder')}
          placeholderTextColor={colors.text.muted}
          multiline
          autoFocus
          textAlignVertical="top"
        />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
            <Text style={styles.cancelText}>{t('instructor.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>{t('instructor.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{t('instructor.notes')}</Text>
        <TouchableOpacity onPress={handleEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="pencil" size={16} color={colors.accent.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteText}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 11,
  },
  noteText: {
    ...typography.body.regular,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.accent.primary}10`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 44,
  },
  addText: {
    ...typography.body.small,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bg.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text.primary,
    ...typography.body.regular,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  saveBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  saveText: {
    ...typography.body.small,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});

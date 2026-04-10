import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

interface DisciplineChipProps {
  name: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}

export function DisciplineChip({ name, color, selected, onPress }: DisciplineChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { borderColor: color },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? colors.bg.primary : color },
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  text: {
    ...typography.body.small,
    fontWeight: '600',
  },
});

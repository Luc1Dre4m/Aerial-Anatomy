import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { movements } from '../../data/movements';
import { Movement, MovementLevel } from '../../utils/types';
import { colors, typography, spacing } from '../../theme';

interface ProgressionTreeProps {
  movementId: string;
  onMovementPress: (movementId: string) => void;
}

interface TreeNode {
  movement: Movement;
  children: TreeNode[];
  depth: number;
}

const LEVEL_ORDER: Record<MovementLevel, number> = {
  fundamentals: 0,
  basico: 1,
  intermedio: 2,
  avanzado: 3,
  elite: 4,
};

const LEVEL_COLORS: Record<MovementLevel, string> = {
  fundamentals: colors.level.fundamentals,
  basico: colors.level.basico,
  intermedio: colors.level.intermedio,
  avanzado: colors.level.avanzado,
  elite: colors.level.elite,
};

function buildTree(movementId: string, depth: number = 0, visited: Set<string> = new Set()): TreeNode | null {
  if (visited.has(movementId)) return null;
  visited.add(movementId);

  const movement = movements.find((m) => m.id === movementId);
  if (!movement) return null;

  const children: TreeNode[] = [];

  // Find movements that have this as prerequisite (progressions forward)
  const progressions = movements
    .filter((m) => m.prerequisite_movements.includes(movementId))
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  for (const prog of progressions) {
    const child = buildTree(prog.id, depth + 1, visited);
    if (child) children.push(child);
  }

  return { movement, children, depth };
}

function findRoot(movementId: string): string {
  const movement = movements.find((m) => m.id === movementId);
  if (!movement || movement.prerequisite_movements.length === 0) return movementId;

  // Go up to the root prerequisite
  let current = movement;
  const visited = new Set<string>();
  while (current.prerequisite_movements.length > 0 && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = movements.find((m) => m.id === current.prerequisite_movements[0]);
    if (!parent) break;
    current = parent;
  }
  return current.id;
}

export function ProgressionTree({ movementId, onMovementPress }: ProgressionTreeProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  const tree = useMemo(() => {
    const rootId = findRoot(movementId);
    return buildTree(rootId);
  }, [movementId]);

  if (!tree) return null;

  // Check if tree has any children (otherwise not interesting to show)
  const hasProgression = tree.children.length > 0 ||
    tree.movement.prerequisite_movements.length > 0;

  if (!hasProgression) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="file-tree" size={18} color={colors.accent.primary} />
        <Text style={styles.headerTitle}>
          {t('progression.title')}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.treeContainer}>
          <TreeNodeView
            node={tree}
            highlightId={movementId}
            lang={lang}
            onPress={onMovementPress}
            isLast={true}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function TreeNodeView({
  node,
  highlightId,
  lang,
  onPress,
  isLast,
}: {
  node: TreeNode;
  highlightId: string;
  lang: 'es' | 'en';
  onPress: (id: string) => void;
  isLast: boolean;
}) {
  const isHighlighted = node.movement.id === highlightId;
  const levelColor = LEVEL_COLORS[node.movement.level];
  const name = lang === 'es' ? node.movement.name_es : node.movement.name_en;

  return (
    <View style={styles.nodeContainer}>
      <View style={styles.nodeRow}>
        {node.depth > 0 && (
          <View style={styles.connector}>
            <View style={[styles.connectorLine, { backgroundColor: levelColor }]} />
            <MaterialCommunityIcons name="chevron-right" size={12} color={levelColor} />
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.nodeCard,
            { borderColor: levelColor },
            isHighlighted && { backgroundColor: `${levelColor}25`, borderWidth: 2 },
          ]}
          onPress={() => onPress(node.movement.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.nodeName,
              isHighlighted && { color: colors.accent.light, fontWeight: '700' },
            ]}
            numberOfLines={2}
          >
            {name}
          </Text>
          <View style={[styles.levelDot, { backgroundColor: levelColor }]}>
            <Text style={styles.levelDotText}>
              {node.movement.level.substring(0, 3).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {node.children.length > 0 && (
        <View style={styles.childrenContainer}>
          {node.children.map((child, index) => (
            <TreeNodeView
              key={child.movement.id}
              node={child}
              highlightId={highlightId}
              lang={lang}
              onPress={onPress}
              isLast={index === node.children.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.body.regular,
    color: colors.accent.primary,
    fontWeight: '700',
  },
  treeContainer: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.xl,
  },
  nodeContainer: {
    gap: spacing.sm,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 24,
  },
  connectorLine: {
    width: 12,
    height: 2,
  },
  nodeCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
    maxWidth: 160,
    gap: spacing.xs,
  },
  nodeName: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontSize: 11,
  },
  levelDot: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  levelDotText: {
    fontSize: 8,
    color: colors.bg.primary,
    fontWeight: '800',
  },
  childrenContainer: {
    paddingLeft: spacing.xxxl,
    gap: spacing.sm,
  },
});

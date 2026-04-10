import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Movement } from '../../utils/types';
import { colors, typography, spacing } from '../../theme';

interface RiskEvaluatorProps {
  movement: Movement;
}

type RiskLevel = 'low' | 'medium' | 'high';

interface EvaluationData {
  riskLevel: RiskLevel;
  score: number;
  factorData: { labelKey: string; status: 'ok' | 'warning' | 'danger'; detailKey: string; detailParams?: Record<string, string | number> }[];
}

function evaluate(movement: Movement): EvaluationData {
  const factorData: EvaluationData['factorData'] = [];
  let totalPoints = 0;
  let maxPoints = 0;

  // Factor 1: Safety icon severity
  maxPoints += 20;
  if (movement.safety_icon === 'info') {
    totalPoints += 20;
    factorData.push({ labelKey: 'risk.inherentLevel', status: 'ok', detailKey: 'risk.lowRisk' });
  } else if (movement.safety_icon === 'warning') {
    totalPoints += 10;
    factorData.push({ labelKey: 'risk.inherentLevel', status: 'warning', detailKey: 'risk.moderateRisk' });
  } else {
    factorData.push({ labelKey: 'risk.inherentLevel', status: 'danger', detailKey: 'risk.criticalRisk' });
  }

  // Factor 2: Level complexity
  maxPoints += 20;
  const levelScores = { fundamentals: 20, basico: 18, intermedio: 12, avanzado: 5, elite: 0 };
  totalPoints += levelScores[movement.level];
  const levelStatus = movement.level === 'avanzado' || movement.level === 'elite' ? 'danger'
    : movement.level === 'intermedio' ? 'warning' : 'ok';
  const levelDetailKey = levelStatus === 'ok' ? 'risk.accessible' : levelStatus === 'warning' ? 'risk.requiresExperience' : 'risk.requiresAdvanced';
  factorData.push({ labelKey: 'risk.levelComplexity', status: levelStatus, detailKey: levelDetailKey });

  // Factor 3: Prerequisite movements count
  maxPoints += 20;
  const prereqCount = movement.prerequisite_movements.length;
  const prereqPoints = prereqCount === 0 ? 20 : prereqCount <= 2 ? 14 : prereqCount <= 4 ? 8 : 0;
  totalPoints += prereqPoints;
  factorData.push({
    labelKey: 'risk.prerequisites',
    status: prereqCount === 0 ? 'ok' : prereqCount <= 2 ? 'warning' : 'danger',
    detailKey: prereqCount === 0 ? 'risk.noPrerequisites' : 'risk.priorMovements',
    detailParams: prereqCount > 0 ? { count: prereqCount } : undefined,
  });

  // Factor 4: Maximum muscle intensity
  maxPoints += 20;
  const maxIntensity = Math.max(...movement.muscles.map((m) => m.intensity), 1);
  const intensityPoints = maxIntensity <= 2 ? 20 : maxIntensity <= 3 ? 14 : maxIntensity <= 4 ? 8 : 2;
  totalPoints += intensityPoints;
  factorData.push({
    labelKey: 'risk.maxDemand',
    status: maxIntensity <= 2 ? 'ok' : maxIntensity <= 3 ? 'warning' : 'danger',
    detailKey: maxIntensity >= 4 ? 'risk.advancedStrength' : 'risk.moderateDemand',
  });

  // Factor 5: Critical stabilizer count
  maxPoints += 20;
  const criticalStabilizers = movement.muscles.filter(
    (m) => m.role === 'estabilizador' && m.intensity >= 4,
  );
  const stabPoints = criticalStabilizers.length === 0 ? 20 : criticalStabilizers.length <= 1 ? 14 : 6;
  totalPoints += stabPoints;
  factorData.push({
    labelKey: 'risk.criticalStabilizers',
    status: criticalStabilizers.length === 0 ? 'ok' : criticalStabilizers.length <= 1 ? 'warning' : 'danger',
    detailKey: criticalStabilizers.length === 0 ? 'risk.noHighDemand' : 'risk.stabilizersDetail',
    detailParams: criticalStabilizers.length > 0 ? { count: criticalStabilizers.length } : undefined,
  });

  const score = Math.round((totalPoints / maxPoints) * 100);
  const riskLevel: RiskLevel = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high';

  return { riskLevel, score, factorData };
}

const RISK_CONFIG: Record<RiskLevel, { color: string; labelKey: string }> = {
  low: { color: colors.success, labelKey: 'risk.low' },
  medium: { color: colors.safety.warning, labelKey: 'risk.medium' },
  high: { color: colors.error, labelKey: 'risk.high' },
};

const STATUS_ICONS = { ok: '✓', warning: '⚠', danger: '✗' };
const STATUS_COLORS = { ok: colors.success, warning: colors.safety.warning, danger: colors.error };

export function RiskEvaluator({ movement }: RiskEvaluatorProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => evaluate(movement), [movement]);
  const risk = RISK_CONFIG[result.riskLevel];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.header, { borderColor: risk.color }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.scoreCircle, { borderColor: risk.color }]}>
            <Text style={[styles.scoreText, { color: risk.color }]}>{result.score}</Text>
          </View>
          <View>
            <Text style={styles.title}>{t('risk.title')}</Text>
            <Text style={[styles.riskLabel, { color: risk.color }]}>{t(risk.labelKey)}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.factors}>
          {result.factorData.map((factor) => (
            <View key={factor.labelKey} style={styles.factorRow}>
              <Text style={[styles.factorIcon, { color: STATUS_COLORS[factor.status] }]}>
                {STATUS_ICONS[factor.status]}
              </Text>
              <View style={styles.factorContent}>
                <Text style={styles.factorLabel}>{t(factor.labelKey)}</Text>
                <Text style={styles.factorDetail}>{t(factor.detailKey, factor.detailParams)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...typography.body.regular,
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 10,
  },
  riskLabel: {
    ...typography.body.regular,
    fontWeight: '700',
  },
  chevron: {
    color: colors.text.muted,
    fontSize: 12,
  },
  factors: {
    backgroundColor: colors.bg.secondary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -12,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
  },
  factorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  factorIcon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
    marginTop: 2,
  },
  factorContent: {
    flex: 1,
    gap: 1,
  },
  factorLabel: {
    ...typography.body.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
  factorDetail: {
    ...typography.body.small,
    color: colors.text.muted,
    fontSize: 11,
  },
});

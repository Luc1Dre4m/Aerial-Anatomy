import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getMuscleById, REGION_LABELS } from '../data/muscles';
import { useAppStore } from '../store/useAppStore';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { InjuryPrevention } from '../components/muscles/InjuryPrevention';
import { getPreventionForRegion } from '../data/injuryPrevention';
import { GradientDivider } from '../components/ui/GradientDivider';
import { AnimatedTitle } from '../components/ui/AnimatedTitle';
import { NotFoundView } from '../components/ui/NotFoundView';
import { colors, typography, spacing } from '../theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { gap: spacing.sm },
  title: {
    ...typography.label.regular,
    color: colors.accent.primary,
    fontSize: 12,
  },
});

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: spacing.xs }}>
      {items.map((item, i) => (
        <View key={`bullet-${i}`} style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Text style={{ color: colors.accent.muted }}>•</Text>
          <Text style={{ ...typography.body.regular, color: colors.text.secondary, flex: 1 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function MuscleDetailScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  const navigation = useNavigation();
  const route = useRoute<any>();
  const muscle = getMuscleById(route.params?.muscleId);

  const isFavorite = useAppStore((s) => s.favoriteMuscles.includes(route.params?.muscleId ?? ''));
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteMuscle);

  if (!muscle) return <NotFoundView />;

  const name = lang === 'es' ? muscle.name_es : muscle.name_en;
  const otherName = lang === 'es' ? muscle.name_en : muscle.name_es;
  const description = lang === 'es' ? muscle.description_es : muscle.description_en;
  const primaryFunction = lang === 'es' ? muscle.primary_function_es : muscle.primary_function_en;
  const origin = lang === 'es' ? muscle.origin_es : muscle.origin_en;
  const insertion = lang === 'es' ? muscle.insertion_es : muscle.insertion_en;
  const injuries = lang === 'es' ? muscle.common_injuries_es : muscle.common_injuries_en;
  const cues = lang === 'es' ? muscle.activation_cues_es : muscle.activation_cues_en;
  const regionLabel = REGION_LABELS[muscle.region][lang];
  const depthLabel = muscle.depth === 'superficial' ? t('muscles.superficial') : t('muscles.deep');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent.primary} />
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          <View style={styles.regionBadge}>
            <Text style={styles.regionText}>{regionLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(muscle.id)} style={styles.favBtn}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.muscle.agonista : colors.text.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.otherName}>{otherName}</Text>
        <Text style={styles.latin}>{muscle.name_latin}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.depthDot, { backgroundColor: muscle.depth === 'superficial' ? colors.accent.primary : colors.text.muted }]} />
          <Text style={styles.metaText}>{depthLabel}</Text>
        </View>

        <Text style={styles.description}>{description}</Text>

        <GradientDivider />

        <Section title={t('muscles.function')}>
          <Text style={styles.bodyText}>{primaryFunction}</Text>
        </Section>

        <Section title={t('muscles.origin')}>
          <Text style={styles.bodyText}>{origin}</Text>
        </Section>

        <Section title={t('muscles.insertion')}>
          <Text style={styles.bodyText}>{insertion}</Text>
        </Section>

        <Section title={t('muscles.innervation')}>
          <Text style={styles.monoText}>{muscle.innervation}</Text>
        </Section>

        <GradientDivider />

        <Section title={t('muscles.injuries')}>
          <BulletList items={injuries} />
        </Section>

        <Section title={t('muscles.cues')}>
          <BulletList items={cues} />
        </Section>

        {/* Injury Prevention Exercises */}
        {(() => {
          const prevention = getPreventionForRegion(muscle.region);
          return prevention ? (
            <>
              <GradientDivider />
              <InjuryPrevention prevention={prevention} />
            </>
          ) : null;
        })()}

        <AuthorCredit />
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  regionBadge: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  favBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionText: {
    ...typography.label.regular,
    color: colors.text.muted,
    fontSize: 10,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  name: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  otherName: {
    ...typography.heading.h3,
    color: colors.text.secondary,
    marginTop: -spacing.sm,
  },
  latin: {
    ...typography.body.regular,
    color: colors.accent.muted,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  depthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaText: {
    ...typography.body.small,
    color: colors.text.muted,
  },
  description: {
    ...typography.body.large,
    color: colors.text.primary,
    lineHeight: 26,
  },
  bodyText: {
    ...typography.body.regular,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  monoText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
});

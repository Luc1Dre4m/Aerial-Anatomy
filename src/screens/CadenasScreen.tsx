import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LanguageToggle } from '../components/ui';
import { AuthorCredit } from '../components/ui/AuthorCredit';
import { ChainCard } from '../components/chains/ChainCard';
import { AnimatedListItem } from '../components/ui/AnimatedListItem';
import { chains } from '../data/chains';
import { AnimatedTitle } from '../components/ui/AnimatedTitle';
import { colors, typography, spacing } from '../theme';

export function CadenasScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // Show suspension chain first (star feature)
  const sorted = [...chains].sort((a, b) => {
    if (a.type === 'suspension') return -1;
    if (b.type === 'suspension') return 1;
    return 0;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LanguageToggle />
        <AnimatedTitle text={t('chains.title')} style={styles.title} />
        <Text style={styles.description}>{t('chains.description')}</Text>

        <View style={styles.list}>
          {sorted.map((chain, index) => (
            <AnimatedListItem key={chain.id} index={index}>
              <ChainCard
                chain={chain}
                onPress={() => navigation.navigate('ChainDetail', { chainId: chain.id })}
              />
            </AnimatedListItem>
          ))}
        </View>

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
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.h1,
    fontFamily: typography.heading.fontFamily,
    color: colors.accent.light,
  },
  description: {
    ...typography.body.large,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  list: {
    gap: spacing.lg,
  },
});

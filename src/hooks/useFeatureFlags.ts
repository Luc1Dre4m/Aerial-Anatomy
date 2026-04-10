import { useAppStore } from '../store/useAppStore';
import { getFeatureFlags, FeatureFlags } from '../services/paywall';

export function useFeatureFlags(): FeatureFlags {
  const subscription = useAppStore((s) => s.subscription);
  return getFeatureFlags(subscription);
}

export function useIsPremium(): boolean {
  const subscription = useAppStore((s) => s.subscription);
  return subscription === 'premium' || subscription === 'instructor';
}

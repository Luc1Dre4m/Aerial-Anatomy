/**
 * RevenueCat integration for Aerial Anatomy.
 *
 * Setup instructions:
 * 1. Create account at https://www.revenuecat.com
 * 2. Create a project and connect your Google Play Console
 * 3. In Google Play Console > Monetizar > Suscripciones, create:
 *    - "premium_monthly" ($1.99/month)
 *    - "premium_annual" ($14.99/year)
 *    - "instructor_monthly" ($4.99/month)
 *    - "instructor_annual" ($39.99/year)
 * 4. In RevenueCat Dashboard:
 *    - Add products from Play Store
 *    - Create Entitlements: "premium_access" and "instructor_access"
 *    - Create Offering "default" with 4 packages
 * 5. Replace REVENUECAT_API_KEY below with your actual key
 */

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { SubscriptionTier, RC_ENTITLEMENTS } from './paywall';

// ⚠️ Replace with your actual RevenueCat API key
// Google Play key from RevenueCat Dashboard > Project > API Keys
const REVENUECAT_API_KEY = Platform.select({
  android: 'YOUR_REVENUECAT_GOOGLE_API_KEY',
  ios: 'YOUR_REVENUECAT_APPLE_API_KEY',
}) ?? '';

let isConfigured = false;

/**
 * Initialize RevenueCat SDK. Call once at app startup (App.tsx).
 */
export async function initRevenueCat(): Promise<void> {
  if (isConfigured || !REVENUECAT_API_KEY || REVENUECAT_API_KEY.startsWith('YOUR_')) {
    if (__DEV__) {
      console.log('[RevenueCat] Skipping init — no API key configured. Using mock mode.');
    }
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    isConfigured = true;

    if (__DEV__) {
      console.log('[RevenueCat] Configured successfully');
    }
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Configuration error:', error);
  }
}

/**
 * Check if RevenueCat is properly configured with a real API key.
 */
export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}

/**
 * Get available subscription offerings.
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isConfigured) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Error fetching offerings:', error);
    return null;
  }
}

/**
 * Purchase a package (subscription).
 * Returns the new subscription tier after purchase.
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; tier: SubscriptionTier }> {
  if (!isConfigured) {
    return { success: false, tier: 'free' };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const tier = getTierFromCustomerInfo(customerInfo);
    return { success: true, tier };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled) {
      // User cancelled — not an error
      return { success: false, tier: 'free' };
    }
    if (__DEV__) console.error('[RevenueCat] Purchase error:', error);
    return { success: false, tier: 'free' };
  }
}

/**
 * Restore previous purchases (e.g., after reinstall or new device).
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  tier: SubscriptionTier;
}> {
  if (!isConfigured) {
    return { success: false, tier: 'free' };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const tier = getTierFromCustomerInfo(customerInfo);
    return { success: true, tier };
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Restore error:', error);
    return { success: false, tier: 'free' };
  }
}

/**
 * Get current customer subscription tier.
 */
export async function getCurrentTier(): Promise<SubscriptionTier> {
  if (!isConfigured) return 'free';

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return getTierFromCustomerInfo(customerInfo);
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] Error getting customer info:', error);
    return 'free';
  }
}

/**
 * Listen for subscription changes (e.g., renewal, expiration, upgrade).
 * Returns an unsubscribe function.
 */
export function onSubscriptionChange(
  callback: (tier: SubscriptionTier) => void
): () => void {
  if (!isConfigured) return () => {};

  const listener = (info: CustomerInfo) => {
    const tier = getTierFromCustomerInfo(info);
    callback(tier);
  };

  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

/**
 * Derive subscription tier from RevenueCat CustomerInfo entitlements.
 */
function getTierFromCustomerInfo(info: CustomerInfo): SubscriptionTier {
  const entitlements = info.entitlements.active;

  if (entitlements[RC_ENTITLEMENTS.instructor]?.isActive) {
    return 'instructor';
  }
  if (entitlements[RC_ENTITLEMENTS.premium]?.isActive) {
    return 'premium';
  }
  return 'free';
}

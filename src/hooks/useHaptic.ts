import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/** Light tap — browsing zones, scrolling lists */
export function hapticLight() {
  if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium tap — selecting a muscle or movement */
export function hapticMedium() {
  if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Success — completing a quiz, finishing a study session */
export function hapticSuccess() {
  if (isSupported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Selection change — toggling favorites, switching views */
export function hapticSelection() {
  if (isSupported) Haptics.selectionAsync();
}

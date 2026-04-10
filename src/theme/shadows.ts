import { Platform, ViewStyle } from 'react-native';

type ShadowLevel = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

function createShadow(elevation: number, opacity: number): ShadowLevel {
  return Platform.select({
    ios: {
      shadowColor: '#9B6DFF',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {},
  }) as ShadowLevel;
}

export const shadows = {
  sm: createShadow(2, 0.15),
  md: createShadow(4, 0.2),
  lg: createShadow(8, 0.25),
} as const;

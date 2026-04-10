import { TextStyle } from 'react-native';

export const typography = {
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    h1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    h3: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
  },

  body: {
    fontFamily: undefined as TextStyle['fontFamily'],
    large: { fontSize: 16, lineHeight: 24 },
    regular: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12, lineHeight: 16 },
  },

  mono: {
    fontFamily: 'JetBrainsMono' as TextStyle['fontFamily'],
    regular: { fontSize: 13, lineHeight: 18 },
    small: { fontSize: 11, lineHeight: 14 },
  },

  label: {
    fontFamily: undefined as TextStyle['fontFamily'],
    regular: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: 1.5,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
} as const;

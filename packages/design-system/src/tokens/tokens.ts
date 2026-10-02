import { colors } from './colors'

export type ColorScheme = 'light' | 'dark'

/** UI dimensions are design pixels; the Panda adapter converts them to rem once. */
export const designTokens = {
  colors,
  spacing: { '0': 0, '4': 4, '8': 8, '12': 12, '16': 16, '24': 24, '32': 32 },
  fontSizes: {
    '11': 11,
    '12': 12,
    '13': 13,
    '14': 14,
    '15': 15,
    '16': 16,
    '20': 20,
    '23': 23,
    '28': 28,
    '30': 30,
    '32': 32,
  },
  lineHeights: {
    '12': 1.45,
    '13': 1.35,
    '14': 1.45,
    '15': 1.45,
    '16': 1.45,
    '20': 1.4,
    '23': 1.45,
    '28': 1.22,
    '30': 1.25,
    '32': 1.25,
  },
  fontWeights: { regular: 400, medium: 500, semibold: 600, emphasized: 650, bold: 700 },
  fonts: {
    ui: '"Inter Variable", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  },
} as const

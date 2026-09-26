import { colors } from './colors'

export type ColorScheme = 'light' | 'dark'

/** UI dimensions are design pixels; the Panda adapter converts them to rem once. */
export const designTokens = {
  colors,
  spacing: { '0': 0, '4': 4, '8': 8, '12': 12, '16': 16, '24': 24, '32': 32 },
  fontSizes: { '12': 12, '14': 14, '16': 16, '20': 20, '32': 32 },
  lineHeights: { '12': 1.5, '14': 1.5, '16': 1.5, '20': 1.4, '32': 1.25 },
  fontWeights: { regular: 400, medium: 500, bold: 700 },
  fonts: {
    ui: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  },
} as const

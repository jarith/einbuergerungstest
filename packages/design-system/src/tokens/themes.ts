import type { ColorScheme } from './tokens'
import { elevation, geometry } from './semantics'
import { designTokens } from './tokens'

type Scale<T> = { readonly [K in keyof T]: number }

export type DesignTheme = Readonly<{
  colors: {
    readonly [K in keyof typeof designTokens.colors]: Readonly<Record<ColorScheme, string>>
  }
  spacing: Scale<typeof designTokens.spacing>
  fontSizes: Scale<typeof designTokens.fontSizes>
  lineHeights: Scale<typeof designTokens.lineHeights>
  fontWeights: Scale<typeof designTokens.fontWeights>
  fonts: { readonly [K in keyof typeof designTokens.fonts]: string }
  geometry: { readonly [K in keyof typeof geometry]: Scale<(typeof geometry)[K]> }
  elevation: { readonly [K in keyof typeof elevation]: string }
}>

export const baselineTheme = { ...designTokens, geometry, elevation } satisfies DesignTheme

/** Small proof that skins can change color, type and geometry without component branches. */
export const alternateTheme = {
  ...baselineTheme,
  colors: {
    ...designTokens.colors,
    accent: { light: '#5435ad', dark: '#c8b6ff' },
    'accent-foreground': { light: '#ffffff', dark: '#201439' },
  },
  fonts: { ...designTokens.fonts, ui: designTokens.fonts.mono },
  geometry: {
    ...geometry,
    sizes: { ...geometry.sizes, 'control.action': 48, 'control.field': 48 },
    radii: { ...geometry.radii, control: 10 },
  },
} satisfies DesignTheme

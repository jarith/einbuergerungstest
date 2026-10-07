import type { CSSVariablesResolver, MantineColorsTuple } from '@mantine/core'
import { createTheme } from '@mantine/core'

import { token } from '../panda/styling'
import { mantineComponents } from './mantine-components'

const accent = token.var('colors.accent')

// Mantine requires ten entries; this adapts one role, not a second shade palette.
const accentRole: MantineColorsTuple = [
  accent,
  accent,
  accent,
  accent,
  accent,
  accent,
  accent,
  accent,
  accent,
  accent,
]

export const mantineTheme = createTheme({
  components: mantineComponents,
  respectReducedMotion: true,
  fontFamily: token.var('fonts.ui'),
  fontFamilyMonospace: token.var('fonts.mono'),
  headings: { fontFamily: token.var('fonts.ui') },
  primaryColor: 'accent',
  primaryShade: 0,
  focusClassName: 'ds-focus',
  colors: { accent: accentRole },
  spacing: {
    xs: token.var('spacing.8'),
    sm: token.var('spacing.12'),
    md: token.var('spacing.16'),
    lg: token.var('spacing.24'),
    xl: token.var('spacing.32'),
  },
  fontSizes: {
    xs: token.var('fontSizes.12'),
    sm: token.var('fontSizes.14'),
    md: token.var('fontSizes.16'),
    lg: token.var('fontSizes.20'),
    xl: token.var('fontSizes.32'),
  },
  lineHeights: {
    xs: token.var('lineHeights.12'),
    sm: token.var('lineHeights.14'),
    md: token.var('lineHeights.16'),
    lg: token.var('lineHeights.20'),
    xl: token.var('lineHeights.32'),
  },
  radius: { sm: token.var('radii.control'), md: token.var('radii.panel') },
  defaultRadius: 'sm',
})

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--mantine-color-body': token.var('colors.canvas'),
    '--mantine-color-text': token.var('colors.content.primary'),
    '--mantine-color-dimmed': token.var('colors.content.muted'),
    '--mantine-color-bright': token.var('colors.content.primary'),
    '--mantine-color-default': token.var('colors.panel.bg'),
    '--mantine-color-default-hover': token.var('colors.action.neutral.hover'),
    '--mantine-color-default-color': token.var('colors.content.primary'),
    '--mantine-color-default-border': token.var('colors.field.border'),
    '--mantine-color-placeholder': token.var('colors.field.placeholder'),
    '--mantine-color-error': token.var('colors.danger'),
    '--mantine-color-anchor': token.var('colors.accent'),
    '--mantine-primary-color-contrast': token.var('colors.action.solid.fg'),
    '--mantine-color-accent-filled': token.var('colors.action.solid.bg'),
    '--mantine-color-accent-filled-hover': token.var('colors.action.solid.hover'),
  },
  light: {},
  dark: {},
})

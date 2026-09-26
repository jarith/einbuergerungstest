import type { colors } from './colors'

/** Roles remain independent even when they currently share the same source color. */
export const colorRoles = {
  canvas: 'background',
  'panel.bg': 'surface',
  'panel.border': 'control-border',
  'content.primary': 'text',
  'content.muted': 'text-muted',
  'action.solid.bg': 'accent',
  'action.solid.fg': 'accent-foreground',
  'action.solid.border': 'accent',
  'action.outline.bg': 'surface',
  'action.outline.fg': 'text',
  'action.outline.border': 'control-border',
  'action.neutral.hover': 'state-hover',
  'action.neutral.pressed': 'state-pressed',
  'field.bg': 'surface',
  'field.fg': 'text',
  'field.border': 'control-border',
  'field.label': 'text',
  'field.placeholder': 'text-muted',
  'field.focus': 'accent',
  'focus.outer': 'accent',
  'focus.inner': 'surface',
} as const satisfies Readonly<Record<string, keyof typeof colors>>

/** UI pixels, except opacity. Add geometry only when a component needs it. */
export const geometry = {
  sizes: {
    'control.action': 44,
    'control.field': 44,
    'icon.action': 18,
    'icon.field': 16,
    content: 704,
  },
  radii: { control: 6, panel: 12 },
  borderWidths: { control: 1, focus: 2 },
  spacing: {
    'control.inline': 16,
    'control.iconGap': 8,
    'field.labelGap': 4,
    'layout.inline': 8,
    'layout.related': 4,
    'layout.section': 16,
    'panel.gap': 16,
    'panel.padding': 24,
    'focus.offset': 3,
  },
  opacity: { disabled: 0.5 },
} as const

export const elevation = { panel: 'none' } as const

export const colorStates = {
  'action.solid.hover': {
    light: 'color-mix(in srgb, {colors.accent} 90%, black)',
    dark: 'color-mix(in srgb, {colors.accent} 90%, white)',
  },
  'action.solid.pressed': {
    light: 'color-mix(in srgb, {colors.accent} 82%, black)',
    dark: 'color-mix(in srgb, {colors.accent} 82%, white)',
  },
} as const

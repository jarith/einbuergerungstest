import { defineSlotRecipe } from '@pandacss/dev'

export const statusBadgeRecipe = defineSlotRecipe({
  className: 'ds-status-badge',
  slots: ['root', 'label', 'section'],
  base: {
    root: {
      minHeight: 'control.badge',
      height: 'auto',
      paddingInline: 'badge.inline',
      borderRadius: 'badge',
      border: 'none',
      textStyle: 'overline',
      textTransform: 'none',
    },
    label: { whiteSpace: 'normal', overflow: 'visible' },
  },
  variants: {
    intent: {
      learning: { root: { backgroundColor: 'badge.learning.bg', color: 'badge.learning.fg' } },
      success: { root: { backgroundColor: 'badge.success.bg', color: 'badge.success.fg' } },
      warning: { root: { backgroundColor: 'badge.warning.bg', color: 'badge.warning.fg' } },
      danger: { root: { backgroundColor: 'badge.danger.bg', color: 'badge.danger.fg' } },
      info: { root: { backgroundColor: 'badge.info.bg', color: 'badge.info.fg' } },
      neutral: { root: { backgroundColor: 'badge.neutral.bg', color: 'badge.neutral.fg' } },
    },
  },
  defaultVariants: { intent: 'neutral' },
})

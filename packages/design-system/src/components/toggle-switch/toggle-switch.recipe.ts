import { defineSlotRecipe } from '@pandacss/dev'

export const toggleSwitchRecipe = defineSlotRecipe({
  className: 'ds-toggle-switch',
  slots: ['root', 'body', 'input', 'track', 'thumb', 'trackLabel', 'label', 'description', 'error'],
  base: {
    root: { minWidth: 0 },
    body: { alignItems: 'center', gap: 'layout.inline' },
    track: {
      width: '54px',
      height: '28px',
      border: '{borderWidths.control} solid {colors.field.border}',
      borderRadius: 'badge',
      backgroundColor: 'surface-muted',
      'input:checked + &': {
        backgroundColor: 'switch.checked.bg',
        borderColor: 'switch.checked.fg',
      },
      'input:focus-visible + &': { layerStyle: 'focus' },
    },
    thumb: { backgroundColor: 'panel.bg' },
    trackLabel: { textStyle: 'overline', color: 'content.primary' },
    label: { textStyle: 'controlLabel', color: 'content.primary' },
    description: { textStyle: 'caption', color: 'content.muted' },
    error: { textStyle: 'caption', color: 'danger' },
  },
  variants: {
    layout: {
      compact: {},
      spread: { body: { justifyContent: 'space-between' } },
    },
  },
  defaultVariants: { layout: 'compact' },
})

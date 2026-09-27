import { defineSlotRecipe } from '@pandacss/dev'

export const panelRecipe = defineSlotRecipe({
  className: 'ds-panel',
  slots: ['root'],
  base: {
    root: {
      layerStyle: 'panel',
      padding: 'panel.padding',
      display: 'flex',
      flexDirection: 'column',
      gap: 'panel.gap',
      minWidth: 0,
    },
  },
  variants: {
    tone: {
      surface: {},
      muted: { root: { backgroundColor: 'surface-muted', borderColor: 'transparent' } },
    },
    edge: {
      bordered: {},
      plain: { root: { border: 'none' } },
    },
  },
  defaultVariants: { tone: 'surface', edge: 'bordered' },
})

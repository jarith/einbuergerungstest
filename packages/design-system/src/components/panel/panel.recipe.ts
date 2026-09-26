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
})

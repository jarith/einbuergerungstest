import { defineSlotRecipe } from '@pandacss/dev'

export const dividerRecipe = defineSlotRecipe({
  className: 'ds-divider',
  slots: ['root', 'label'],
  base: {
    root: { '--divider-color': '{colors.divider}', '--divider-size': '{borderWidths.control}' },
    label: { textStyle: 'caption', color: 'content.muted' },
  },
})

import { defineSlotRecipe } from '@pandacss/dev'

export const tooltipRecipe = defineSlotRecipe({
  className: 'ds-tooltip',
  slots: ['tooltip'],
  base: {
    tooltip: {
      layerStyle: 'panel',
      textStyle: 'caption',
      padding: '12',
      maxWidth: '[min(22rem, calc(100vw - 1rem))]',
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
    },
  },
})

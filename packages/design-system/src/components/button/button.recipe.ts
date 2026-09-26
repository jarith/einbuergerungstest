import { defineSlotRecipe } from '@pandacss/dev'

import { interactive, appearances } from '../../recipes/interaction/interaction.recipe'

export const buttonRecipe = defineSlotRecipe({
  className: 'ds-button',
  slots: ['root', 'inner', 'label', 'section', 'loader'],
  base: {
    root: {
      ...interactive,
      minHeight: 'control.action',
      maxWidth: '100%',
      minWidth: 0,
      height: 'auto',
      paddingBlock: '4',
      paddingInline: 'control.inline',
      border: '{borderWidths.control} solid',
      borderRadius: 'control',
      boxShadow: 'none',
    },
    inner: { gap: 'control.iconGap' },
    label: { whiteSpace: 'normal', overflow: 'visible' },
    section: { margin: 0, '& svg': { width: 'icon.action', height: 'icon.action' } },
    loader: {
      color: 'inherit',
      '--loader-size': '{sizes.icon.action}',
      '--loader-color': 'currentColor',
    },
  },
  variants: { appearance: appearances },
  defaultVariants: { appearance: 'solid' },
})

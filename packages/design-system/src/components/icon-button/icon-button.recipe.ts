import { defineSlotRecipe } from '@pandacss/dev'

import { appearances, interactive } from '../../recipes/interaction/interaction.recipe'

export const iconButtonRecipe = defineSlotRecipe({
  className: 'ds-icon-button',
  slots: ['root', 'icon', 'loader'],
  base: {
    root: {
      ...interactive,
      width: 'control.icon',
      minWidth: 'control.icon',
      height: 'control.icon',
      border: '{borderWidths.control} solid',
      borderRadius: 'control',
    },
    icon: { '& svg': { width: 'icon.action', height: 'icon.action' } },
    loader: { '--loader-size': '{sizes.icon.action}', '--loader-color': 'currentColor' },
  },
  variants: { appearance: appearances },
  defaultVariants: { appearance: 'outline' },
})

import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const navigationItemRecipe = defineSlotRecipe({
  className: 'ds-navigation-item',
  slots: ['root', 'body', 'label', 'description', 'section', 'chevron'],
  base: {
    root: {
      ...interactive,
      minHeight: 'control.field',
      paddingBlock: '8',
      paddingInline: '12',
      borderRadius: 'navigation',
      color: 'content.primary',
      '&[data-active]': { backgroundColor: 'navigation.current.bg', color: 'content.primary' },
    },
    label: { textStyle: 'controlLabel' },
    description: { textStyle: 'caption', color: 'content.muted' },
    section: {
      margin: 0,
      color: 'content.muted',
      '[data-active] &': { color: 'navigation.current.icon' },
    },
  },
})

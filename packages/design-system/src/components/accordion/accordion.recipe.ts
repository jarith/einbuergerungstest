import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const accordionRecipe = defineSlotRecipe({
  className: 'ds-accordion',
  slots: ['root', 'item', 'itemTitle', 'control', 'label', 'chevron', 'panel', 'content', 'icon'],
  base: {
    root: { minWidth: '0' },
    item: { borderBottom: 'none', borderTop: '{borderWidths.control} solid {colors.panel.border}' },
    itemTitle: { margin: '0' },
    control: {
      ...interactive,
      minHeight: 'control.icon',
      width: 'full',
      paddingBlock: '16',
      paddingInline: '0',
      gap: '16',
      color: 'content.primary',
      backgroundColor: 'transparent',
      borderRadius: 'control',
      textAlign: 'start',
    },
    label: { minWidth: '0', padding: '0', fontWeight: 'semibold' },
    chevron: {
      transition: 'transform {durations.backdrop} {easings.enter}',
      width: 'control.field',
      height: 'control.field',
      justifyContent: 'center',
      color: 'content.muted',
      flexShrink: '0',
    },
    content: { padding: '0', paddingBottom: '24', color: 'content.primary' },
    panel: { minWidth: '0' },
  },
})

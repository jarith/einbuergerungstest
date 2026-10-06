import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const tabsRecipe = defineSlotRecipe({
  className: 'ds-tabs',
  slots: ['root', 'list', 'tab', 'tabLabel', 'tabSection', 'panel'],
  base: {
    root: { minWidth: '0' },
    list: {
      gap: '8',
      borderBottom: '{borderWidths.control} solid {colors.panel.border}',
      _before: { display: 'none' },
    },
    tab: {
      ...interactive,
      minHeight: 'control.icon',
      paddingBlock: '12',
      paddingInline: '24',
      border: 'none',
      borderBottom: '[3px solid transparent]',
      borderRadius: '0',
      backgroundColor: 'transparent',
      color: 'content.muted',
      whiteSpace: 'normal',
      '&[data-active]': { borderBottomColor: 'accent', color: 'content.primary' },
      '@media (max-width: 30rem)': { flex: '1', paddingInline: '12' },
    },
    tabLabel: { lineHeight: '14' },
    panel: { paddingTop: '24', minWidth: '0', _focusVisible: { layerStyle: 'focus' } },
  },
})

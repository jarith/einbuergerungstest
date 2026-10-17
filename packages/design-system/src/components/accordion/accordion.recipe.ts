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
  variants: {
    appearance: {
      inline: {},
      separated: {
        root: { display: 'flex', flexDirection: 'column', gap: '16' },
        item: { borderTopWidth: '0', backgroundColor: 'panel.bg', borderRadius: 'panel' },
        control: {
          paddingInline: '16',
          gap: '8',
          backgroundColor: 'surface-muted',
          '@media (min-width: 48rem)': { gap: '16' },
          '&[data-active]': { borderBottomLeftRadius: '0', borderBottomRightRadius: '0' },
          '@media (hover: hover) and (pointer: fine)': {
            '&:not(:disabled, [data-disabled], [data-loading], [aria-disabled=true]):hover': {
              backgroundColor: 'action.neutral.pressed',
            },
          },
        },
        content: { padding: '16' },
      },
    },
  },
  defaultVariants: { appearance: 'inline' },
})

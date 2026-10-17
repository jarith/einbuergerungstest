import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const accordionRecipe = defineSlotRecipe({
  className: 'ds-accordion',
  slots: [
    'root',
    'item',
    'itemTitle',
    'control',
    'label',
    'chevron',
    'panel',
    'content',
    'icon',
    'groupTitle',
    'groupNumber',
    'groupBody',
  ],
  base: {
    groupTitle: {
      fontSize: '16',
      lineHeight: '16',
      fontWeight: 'semibold',
      '&[data-numbered]': { fontSize: '18' },
      '@media (min-width: 48rem)': { fontSize: '18' },
    },
    groupNumber: {
      width: '[24px]',
      flexShrink: '0',
      fontSize: '14',
      lineHeight: '16',
      fontWeight: 'medium',
      color: 'content.muted',
    },
    groupBody: {
      '@media (min-width: 64rem)': { '&[data-numbered]': { paddingInlineStart: '40' } },
      '& > *': { minWidth: '0' },
      '& > button': { alignSelf: 'start' },
    },
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
      width: 'icon.action',
      height: 'icon.action',
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

import { defineSlotRecipe } from '@pandacss/dev'

import { interactive, appearances } from '../../recipes/interaction/interaction.recipe'

export const buttonRecipe = defineSlotRecipe({
  className: 'ds-button',
  slots: ['root', 'inner', 'label', 'section', 'loader'],
  base: {
    root: {
      ...interactive,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'control.action',
      maxWidth: '100%',
      minWidth: 0,
      height: 'auto',
      paddingBlock: '8',
      paddingInline: 'control.inline',
      border: '{borderWidths.control} solid',
      borderRadius: 'control',
      boxShadow: 'none',
      textStyle: 'actionLabel',
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
  variants: {
    appearance: {
      ...appearances,
      danger: {
        root: {
          backgroundColor: 'action.danger.bg',
          color: 'action.danger.fg',
          borderColor: 'action.danger.border',
          '&:not(:disabled, [data-disabled], [data-loading]):hover': {
            backgroundColor: 'action.danger.hover',
          },
          '&:not(:disabled, [data-disabled], [data-loading]):active': {
            backgroundColor: 'action.danger.pressed',
          },
        },
      },
    },
  },
  defaultVariants: { appearance: 'solid' },
})

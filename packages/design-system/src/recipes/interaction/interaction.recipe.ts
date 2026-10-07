import type { SystemStyleObject } from '@pandacss/types'

export const interactive = {
  boxSizing: 'border-box',
  textStyle: 'controlLabel',
  touchAction: 'manipulation',
  transition:
    'background-color {durations.press} {easings.enter}, border-color {durations.press} {easings.enter}',
  _focusVisible: { layerStyle: 'focus' },
  '&:is(:disabled, [data-disabled], [data-loading])': {
    opacity: 'disabled',
    cursor: 'not-allowed',
  },
  '@media (hover: hover) and (pointer: fine)': {
    '&:not(:disabled, [data-disabled], [data-loading], [aria-disabled=true]):hover': {
      backgroundColor: 'action.neutral.hover',
    },
  },
  '&:not(:disabled, [data-disabled], [data-loading], [aria-disabled=true]):active': {
    backgroundColor: 'action.neutral.pressed',
  },
} satisfies SystemStyleObject

export const appearances = {
  solid: {
    root: {
      backgroundColor: 'action.solid.bg',
      color: 'action.solid.fg',
      borderColor: 'action.solid.border',
      '@media (hover: hover) and (pointer: fine)': {
        '&:not(:disabled, [data-disabled], [data-loading]):hover': {
          backgroundColor: 'action.solid.hover',
        },
      },
      '&:not(:disabled, [data-disabled], [data-loading]):active': {
        backgroundColor: 'action.solid.pressed',
      },
    },
  },
  outline: {
    root: {
      backgroundColor: 'action.outline.bg',
      color: 'action.outline.fg',
      borderColor: 'action.outline.border',
    },
  },
  ghost: {
    root: { backgroundColor: 'transparent', color: 'content.primary', borderColor: 'transparent' },
  },
} satisfies Record<string, Record<string, SystemStyleObject>>

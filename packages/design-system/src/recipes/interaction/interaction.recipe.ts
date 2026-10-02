import type { SystemStyleObject } from '@pandacss/types'

export const interactive = {
  boxSizing: 'border-box',
  textStyle: 'controlLabel',
  _focusVisible: { layerStyle: 'focus' },
  '&:is(:disabled, [data-disabled], [data-loading])': {
    opacity: 'disabled',
    cursor: 'not-allowed',
  },
  '&:not(:disabled, [data-disabled], [data-loading], [aria-disabled=true]):hover': {
    backgroundColor: 'action.neutral.hover',
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
      '&:not(:disabled, [data-disabled], [data-loading]):hover': {
        backgroundColor: 'action.solid.hover',
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

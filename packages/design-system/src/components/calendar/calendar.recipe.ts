import type { SystemStyleObject } from '@pandacss/types'
import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

const control = {
  ...interactive,
  color: 'content.primary',
  backgroundColor: 'transparent',
  border: '{borderWidths.control} solid transparent',
  borderRadius: 'control',
  height: 'control.field',
} satisfies SystemStyleObject

const dateControl = {
  ...control,
  '&[data-selected]': {
    backgroundColor: 'action.solid.bg',
    color: 'action.solid.fg',
    borderColor: 'action.solid.border',
    fontWeight: 'semibold',
    opacity: 1,
    '&:not(:disabled, [data-disabled]):hover': { backgroundColor: 'action.solid.hover' },
    '&:not(:disabled, [data-disabled]):active': { backgroundColor: 'action.solid.pressed' },
  },
} satisfies SystemStyleObject

export const calendarRecipe = defineSlotRecipe({
  className: 'ds-calendar',
  slots: [
    'dropdown',
    'calendarHeader',
    'calendarHeaderControl',
    'calendarHeaderLevel',
    'month',
    'weekday',
    'day',
    'monthsListControl',
    'yearsListControl',
    'clearButton',
    'section',
  ],
  base: {
    dropdown: {
      '--calendar-day-size': 'min({sizes.control.field}, calc((100vw - {spacing.48}) / 7))',
      layerStyle: 'panel',
      padding: '12',
      maxWidth: 'calc(100vw - {spacing.16})',
    },
    calendarHeader: { maxWidth: 'none', marginBottom: '8', gap: '4' },
    calendarHeaderControl: {
      ...control,
      width: 'control.field',
      '& svg': { width: 'icon.action', height: 'icon.action' },
    },
    calendarHeaderLevel: { ...control, textStyle: 'actionLabel' },
    month: { borderCollapse: 'separate', borderSpacing: '0' },
    weekday: { textStyle: 'compactCaption', color: 'content.muted', paddingBottom: '8' },
    day: {
      ...dateControl,
      width: 'var(--calendar-day-size)',
      textStyle: 'caption',
      fontVariantNumeric: 'tabular-nums',
      '&[data-outside]:not([data-selected])': { color: 'content.muted', opacity: 1 },
      '&:is(:disabled, [data-disabled])': { color: 'content.muted', opacity: 'disabled' },
      '&[data-today]:not([data-selected])': {
        borderColor: 'field.border',
        fontWeight: 'semibold',
      },
    },
    monthsListControl: { ...dateControl, width: 'calc(var(--calendar-day-size) * 7 / 3)' },
    yearsListControl: { ...dateControl, width: 'calc(var(--calendar-day-size) * 7 / 3)' },
    clearButton: {
      ...control,
      width: 'control.segmentCompact',
      height: 'control.segmentCompact',
      color: 'content.muted',
    },
    section: { width: 'control.field' },
  },
})

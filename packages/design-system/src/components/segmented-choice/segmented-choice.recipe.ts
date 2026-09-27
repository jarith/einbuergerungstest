import { defineSlotRecipe } from '@pandacss/dev'

export const segmentedChoiceRecipe = defineSlotRecipe({
  className: 'ds-segmented-choice',
  slots: ['root', 'control', 'input', 'label', 'indicator', 'innerLabel'],
  base: {
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'layout.inline',
      padding: 0,
      backgroundColor: 'transparent',
      overflow: 'visible',
    },
    control: { border: 'none', flexGrow: 0 },
    indicator: { display: 'none' },
    label: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'control.segment',
      paddingInline: 'control.inline',
      border: '{borderWidths.control} solid {colors.action.outline.border}',
      borderRadius: 'field',
      backgroundColor: 'field.bg',
      color: 'content.primary',
      textStyle: 'controlLabel',
      whiteSpace: 'normal',
      '&[data-active]': {
        backgroundColor: 'action.solid.bg',
        borderColor: 'action.solid.border',
        color: 'action.solid.fg',
      },
      '&[data-disabled]': { opacity: 'disabled', cursor: 'not-allowed' },
      'input:focus-visible + &': { layerStyle: 'focus' },
      '&:not([data-active], [data-disabled]):hover': { backgroundColor: 'action.neutral.hover' },
    },
  },
  variants: {
    density: {
      regular: {},
      compact: {
        label: {
          minHeight: 'control.segmentCompact',
          paddingInline: '12',
          borderRadius: 'badge',
          textStyle: 'caption',
        },
      },
    },
  },
  defaultVariants: { density: 'regular' },
})

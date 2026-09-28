import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const choiceGroupRecipe = defineSlotRecipe({
  className: 'ds-choice-group',
  slots: ['card', 'marker', 'body', 'label', 'description', 'result'],
  base: {
    card: {
      ...interactive,
      width: '100%',
      minHeight: 'control.choice',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '12',
      paddingBlock: 'choice.block',
      paddingInline: 'control.inline',
      backgroundColor: 'choice.bg',
      color: 'content.primary',
      border: '{borderWidths.control} solid {colors.choice.border}',
      borderRadius: 'control',
      textAlign: 'start',
      '&[data-checked]': {
        backgroundColor: 'choice.selected.bg',
        borderColor: 'choice.selected.border',
        borderWidth: 'selected',
      },
    },
    marker: {
      display: 'grid',
      placeItems: 'center',
      width: '32',
      height: '32',
      flexShrink: 0,
      backgroundColor: 'surface-muted',
      border: '{borderWidths.control} solid {colors.choice.border}',
      borderRadius: 'field',
      textStyle: 'controlLabel',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      flex: 1,
      overflowWrap: 'anywhere',
    },
    label: { textStyle: 'body', fontWeight: 'medium' },
    description: { textStyle: 'choiceDescription', color: 'content.muted' },
    result: {
      textStyle: 'caption',
      fontWeight: 'semibold',
      flexShrink: 0,
      overflowWrap: 'anywhere',
      '@media (max-width: 40rem)': { flexBasis: '100%' },
    },
  },
  variants: {
    result: {
      none: {},
      correct: {
        card: {
          backgroundColor: 'dim-green',
          borderColor: 'success',
          borderWidth: 'selected',
          '&:is(:hover, :active)': { backgroundColor: 'dim-green' },
        },
        marker: { backgroundColor: 'dim-green', borderColor: 'success' },
        result: { color: 'success' },
      },
      incorrect: {
        card: {
          backgroundColor: 'dim-red',
          borderColor: 'danger',
          borderWidth: 'selected',
          '&:is(:hover, :active)': { backgroundColor: 'dim-red' },
        },
        marker: { backgroundColor: 'dim-red', borderColor: 'danger' },
        result: { color: 'danger' },
      },
    },
  },
  defaultVariants: { result: 'none' },
})

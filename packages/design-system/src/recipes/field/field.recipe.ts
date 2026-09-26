import { defineSlotRecipe } from '@pandacss/dev'

export const fieldRecipe = defineSlotRecipe({
  className: 'ds-field',
  slots: ['root', 'label', 'description', 'error', 'required'],
  base: {
    root: { minWidth: 0 },
    label: { textStyle: 'caption', color: 'field.label', marginBottom: 'field.labelGap' },
    description: { textStyle: 'caption', color: 'content.muted' },
    error: { textStyle: 'caption', color: 'danger', marginTop: 'layout.related' },
    required: { color: 'danger' },
  },
})

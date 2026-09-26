import { defineSlotRecipe } from '@pandacss/dev'

export const inputRecipe = defineSlotRecipe({
  className: 'ds-input',
  slots: ['wrapper', 'input', 'section'],
  base: {
    wrapper: {},
    input: {
      paddingInline: 'control.inline',
      '[data-with-left-section] > &': {
        paddingInlineStart:
          'calc(var(--input-left-section-width, {sizes.control.field}) + {spacing.layout.related})',
      },
      '[data-with-right-section] > &': {
        paddingInlineEnd:
          'calc(var(--input-right-section-width, {sizes.control.field}) + {spacing.layout.related})',
      },
      layerStyle: 'field',
      textStyle: 'body',
      minHeight: 'control.field',
      height: 'control.field',
      '&::placeholder': { color: 'field.placeholder' },
      '&:focus': { borderColor: 'field.focus' },
      _focusVisible: { layerStyle: 'focus' },
      '&[data-error]': { borderColor: 'danger', color: 'field.fg' },
      '&:disabled': { opacity: 'disabled', backgroundColor: 'field.bg', color: 'field.fg' },
    },
    section: { color: 'content.muted', '& svg': { width: 'icon.field', height: 'icon.field' } },
  },
})

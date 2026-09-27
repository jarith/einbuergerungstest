import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const inlineNoticeRecipe = defineSlotRecipe({
  className: 'ds-inline-notice',
  slots: ['root', 'wrapper', 'icon', 'body', 'title', 'label', 'message', 'closeButton'],
  base: {
    root: { paddingBlock: '12', paddingInline: '16', borderRadius: 'control', border: 'none' },
    wrapper: { gap: 'layout.inline' },
    icon: { color: 'content.primary', margin: 0 },
    title: { textStyle: 'controlLabel', color: 'content.primary' },
    message: { textStyle: 'caption', color: 'content.primary' },
    closeButton: { ...interactive, color: 'content.primary' },
  },
  variants: {
    intent: {
      success: { root: { backgroundColor: 'notice.success.bg' }, icon: { color: 'success' } },
      warning: { root: { backgroundColor: 'notice.warning.bg' }, icon: { color: 'warning' } },
      danger: { root: { backgroundColor: 'notice.danger.bg' }, icon: { color: 'danger' } },
      info: { root: { backgroundColor: 'notice.info.bg' }, icon: { color: 'info' } },
    },
  },
  defaultVariants: { intent: 'info' },
})

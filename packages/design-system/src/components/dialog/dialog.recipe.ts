import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const dialogRecipe = defineSlotRecipe({
  className: 'ds-dialog',
  slots: ['root', 'inner', 'overlay', 'content', 'header', 'title', 'body', 'close'],
  base: {
    inner: { padding: '16' },
    overlay: { backgroundColor: 'color-mix(in srgb, {colors.text} 43%, transparent)' },
    content: {
      backgroundColor: 'panel.bg',
      color: 'content.primary',
      border: '{borderWidths.control} solid {colors.border-strong}',
      borderRadius: 'dialog',
      boxShadow: 'dialog',
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: 'calc(100dvh - 2rem)',
      overflowY: 'auto',
    },
    header: {
      backgroundColor: 'panel.bg',
      padding: 'dialog.padding',
      paddingBottom: '12',
      gap: 'layout.inline',
      '@media (max-width: 40rem)': { padding: '20px', paddingBottom: '12' },
    },
    title: {
      textStyle: 'dialogTitle',
      color: 'content.primary',
      '@media (max-width: 40rem)': { fontSize: '23', lineHeight: '23' },
    },
    body: {
      padding: 'dialog.padding',
      paddingTop: '0',
      textStyle: 'body',
      color: 'content.primary',
      '@media (max-width: 40rem)': { padding: '20px', paddingTop: '0' },
    },
    close: { ...interactive, color: 'content.primary', flexShrink: 0 },
  },
})

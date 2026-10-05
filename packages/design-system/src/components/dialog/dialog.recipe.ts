import { defineSlotRecipe } from '@pandacss/dev'

import { interactive } from '../../recipes/interaction/interaction.recipe'

export const dialogRecipe = defineSlotRecipe({
  className: 'ds-dialog',
  slots: ['root', 'inner', 'overlay', 'content', 'header', 'title', 'body', 'close'],
  base: {
    inner: { padding: '20' },
    overlay: { backgroundColor: 'scrim' },
    content: {
      backgroundColor: 'panel.bg',
      color: 'content.primary',
      border: '{borderWidths.control} solid {colors.border-strong}',
      borderRadius: 'dialog',
      boxShadow: 'dialog',
      maxWidth: 'calc(100vw - 2.5rem)',
      maxHeight: 'calc(100dvh - 2.5rem)',
      overflowY: 'auto',
    },
    header: {
      backgroundColor: 'panel.bg',
      padding: 'dialog.padding',
      paddingBottom: '12',
      gap: 'layout.inline',
      '@media (max-width: 40rem)': { padding: '20', paddingBottom: '12' },
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
      '@media (max-width: 40rem)': { padding: '20', paddingTop: '0' },
    },
    close: {
      ...interactive,
      color: 'content.primary',
      flexShrink: 0,
      width: 'control.icon',
      height: 'control.icon',
      '& svg': { width: 'icon.action', height: 'icon.action' },
    },
  },
  variants: {
    fullScreen: {
      true: {
        inner: { padding: '0' },
        content: {
          '--dialog-safe-padding': '{spacing.dialog.padding}',
          '@media (max-width: 40rem)': { '--dialog-safe-padding': '{spacing.20}' },
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '[100vw]',
          maxHeight: 'dvh',
          height: 'dvh',
          border: 'none',
          borderRadius: '0',
          overflow: 'hidden',
        },
        header: {
          flexShrink: '0',
          paddingBlock: '[max(var(--dialog-safe-padding), env(safe-area-inset-top)) {spacing.12}]',
          paddingInline:
            '[max(var(--dialog-safe-padding), env(safe-area-inset-left)) max(var(--dialog-safe-padding), env(safe-area-inset-right))]',
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          flex: '1',
          minHeight: '0',
          overflow: 'hidden',
          paddingBlock: '[0 max(var(--dialog-safe-padding), env(safe-area-inset-bottom))]',
          paddingInline:
            '[max(var(--dialog-safe-padding), env(safe-area-inset-left)) max(var(--dialog-safe-padding), env(safe-area-inset-right))]',
        },
      },
    },
  },
})

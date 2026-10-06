import { css } from '@einbuergerungstest/design-system'

// Desktop geometry follows the sidebar and main-area frames in einbuergerungstest.pen.
export const shellStyles = {
  root: css.raw({
    minHeight: 'dvh',
    paddingBlock: '[env(safe-area-inset-top) env(safe-area-inset-bottom)]',
    paddingInline: '[env(safe-area-inset-left) env(safe-area-inset-right)]',
    grid: '1fr / 1fr',
    gap: '0',
    '@media (min-width: 48rem)': { grid: 'auto 1fr / 1fr' },
    '@media (min-width: 64rem)': {
      grid: '1fr / {sizes.shell.sidebar} minmax(0, 1fr)',
    },
  }),
  sidebar: css({
    display: 'contents',
    '@media (min-width: 64rem)': {
      display: 'flex',
      flexFlow: 'column',
      position: 'sticky',
      // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Keep the opposite sticky inset auto; strict tokens cannot express a two-value insetBlock.
      insetBlockStart: '0',
      height: 'dvh',
      boxSizing: 'border-box',
      overflow: 'auto',
      background: 'panel.bg',
      borderInlineEnd: '{borderWidths.control} solid {colors.panel.border}',
      paddingBlock: 'shell.sidebarBlock',
      paddingInline: 'shell.sidebarInline',
      gap: '8',
    },
  }),
  main: css.raw({
    isolation: 'isolate',
    gap: 'layout.section',
    minWidth: '0',
    paddingBlock: '[1.5rem calc(6rem + env(safe-area-inset-bottom))]',
    paddingInline: '20',
    gridRow: '1',
    '@media (min-width: 48rem)': { gridRow: '2', paddingBlock: '32', paddingInline: '36' },
    '@media (min-width: 64rem)': {
      gridColumn: '2',
      gridRow: '1',
      paddingBlock: 'shell.contentBlock',
      paddingInline: 'shell.contentInline',
      gap: '24',
    },
  }),
  content: css.raw({
    display: 'contents',
    '@media (min-width: 64rem)': {
      '&[data-centered]': {
        display: 'flex',
        width: '[50vw]',
        maxWidth: '[100%]',
        alignSelf: 'center',
        gap: '24',
      },
    },
  }),
  skip: css({
    position: 'absolute',
    // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Anchor only the start edge; strict tokens cannot express a two-value insetBlock.
    insetBlockStart: '0',
    // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Anchor only the start edge; strict tokens cannot express a two-value insetInline.
    insetInlineStart: '0',
    zIndex: '10',
    background: 'panel.bg',
    padding: 'control.inline',
    transform: 'translateY(-100%)',
    _focus: { transform: 'translateY(0)' },
  }),
}

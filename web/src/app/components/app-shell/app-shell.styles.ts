import { css } from '@einbuergerungstest/design-system'

// Desktop geometry follows the sidebar and main-area frames in einbuergerungstest.pen.
export const shellStyles = {
  root: css.raw({
    minHeight: 'dvh',
    grid: 'auto 1fr auto / 1fr',
    gap: '0',
    '@media (min-width: 48rem)': { grid: 'auto auto 1fr / 1fr' },
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
    gap: 'layout.section',
    minWidth: '0',
    padding: 'shell.pagePadding',
    gridRow: '2',
    '@media (min-width: 48rem)': { gridRow: '3' },
    '@media (min-width: 64rem)': {
      gridColumn: '2',
      gridRow: '1',
      paddingBlock: 'shell.contentBlock',
      paddingInline: 'shell.contentInline',
      gap: '24',
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

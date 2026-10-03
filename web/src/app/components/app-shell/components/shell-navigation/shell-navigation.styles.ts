import { css } from '@einbuergerungstest/design-system'

export const styles = {
  navigation: css.raw({
    position: 'fixed',
    insetInline: '0',
    // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Keep the opposite sticky inset auto; strict tokens cannot express a two-value insetBlock.
    insetBlockEnd: '0',
    zIndex: '1',
    background: 'panel.bg',
    padding: 'shell.navigationPadding',
    borderBlockStart: '{borderWidths.control} solid {colors.panel.border}',
    grid: 'none / repeat(5, minmax(0, 1fr))',
    placeSelf: 'end stretch',
    gap: '2',
    '@media (min-width: 48rem)': {
      position: 'sticky',
      gap: '4',
      paddingBlock: '0',
      paddingInline: '36',
      minHeight: '[3.25rem]',
      gridRow: '2',
      placeSelf: 'start stretch',
      // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Switch the sticky edge from the mobile bottom to the tablet top.
      insetBlockStart: '0',
      insetBlockEnd: 'auto',
    },
    '@media (min-width: 64rem)': {
      position: 'static',
      zIndex: 'auto',
      display: 'flex',
      flexFlow: 'column',
      borderBlockStart: 'none',
      padding: '0',
      placeSelf: 'stretch',
      flex: '1',
    },
  }),
  navItem: css({
    minHeight: 'control.action',
    minWidth: '0',
    paddingInline: '0',
    paddingBlock: '4',
    overflowWrap: 'anywhere',
    flexFlow: 'column',
    gap: '4',
    '@media (min-width: 48rem)': { flexFlow: 'row', gap: '12', paddingInline: '12' },
  }),
  navLabel: css({
    font: '{fontWeights.medium} {fontSizes.12}/{lineHeights.14} {fonts.ui}',
    '@media (min-width: 48rem)': { fontSize: '14' },
    whiteSpace: 'normal',
    '[aria-current=page] &': {
      fontWeight: 'emphasized',
    },
  }),
  icon: css({ display: 'block', width: 'icon.action', height: 'icon.action', flex: 'none' }),
}

import { css } from '@einbuergerungstest/design-system'

export const styles = {
  navigation: css.raw({
    background: 'panel.bg',
    padding: 'shell.navigationPadding',
    borderBlockStart: '{borderWidths.control} solid {colors.panel.border}',
    grid: 'none / repeat(5, minmax(0, 1fr))',
    placeSelf: 'end stretch',
    gap: '8',
    '@media (min-width: 48rem)': { gridRow: '2', placeSelf: 'start stretch' },
    '@media (min-width: 64rem)': {
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
    overflowWrap: 'anywhere',
    flexFlow: 'column',
    gap: '4',
    '@media (min-width: 48rem)': { flexFlow: 'row', gap: '12', paddingInline: '12' },
  }),
  navLabel: css({
    font: '{fontWeights.medium} {fontSizes.11}/{lineHeights.14} {fonts.ui}',
    '@media (min-width: 48rem)': { fontSize: '14' },
    whiteSpace: 'normal',
    '[aria-current=page] &': {
      fontWeight: 'emphasized',
    },
  }),
  icon: css({ display: 'block', width: 'icon.action', height: 'icon.action', flex: 'none' }),
}

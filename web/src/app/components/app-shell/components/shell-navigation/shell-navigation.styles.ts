import { css } from '@einbuergerungstest/design-system'

export const styles = {
  navigation: css.raw({
    background: 'panel.bg',
    padding: 'shell.navigationPadding',
    borderBlockStart: '{borderWidths.control} solid {colors.panel.border}',
    grid: 'none / repeat(auto-fit, minmax(min(100%, 6rem), 1fr))',
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
    overflowWrap: 'normal',
    flexFlow: 'column',
    gap: '4',
    '@media (min-width: 48rem)': { flexFlow: 'row', gap: '12', paddingInline: '12' },
  }),
  navLabel: css({
    font: '{fontWeights.medium} {fontSizes.14}/{lineHeights.14} {fonts.ui}',
    whiteSpace: 'normal',
    '[aria-current=page] &': {
      font: '{fontWeights.emphasized} {fontSizes.14}/{lineHeights.14} {fonts.ui}',
    },
  }),
  icon: css({ display: 'block', width: 'icon.action', height: 'icon.action', flex: 'none' }),
}

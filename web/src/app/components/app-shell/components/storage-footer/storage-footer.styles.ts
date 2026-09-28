import { css } from '@einbuergerungstest/design-system'

export const styles = {
  footer: css.raw({
    display: 'none',
    '@media (min-width: 64rem)': {
      display: 'flex',
      placeItems: 'center normal',
      gap: '8',
      borderBlockStart: '{borderWidths.control} solid {colors.divider}',
      // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Only the border-facing side needs padding; strict tokens cannot express a two-value paddingBlock.
      paddingBlockStart: '8',
      minHeight: 'shell.footer',
      color: 'content.muted',
      font: '{fontWeights.medium} {fontSizes.12}/{lineHeights.12} {fonts.ui}',
    },
  }),
  icon: css({ display: 'block', width: 'icon.action', height: 'icon.action', flex: 'none' }),
}

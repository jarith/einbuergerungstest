import { css } from '@einbuergerungstest/design-system'

export const styles = {
  header: css.raw({
    gap: '8',
    padding: 'shell.headerPadding',
    '@media (min-width: 64rem)': {
      padding: '0',
      // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Preserve the one-sided gap; strict tokens cannot express a two-value paddingBlock.
      paddingBlockEnd: '32',
    },
  }),
  title: css({
    font: '{fontWeights.bold} {fontSizes.20}/{lineHeights.12} {fonts.ui}',
    overflowWrap: 'anywhere',
  }),
  region: css({
    color: 'content.muted',
    font: '{fontWeights.bold} {fontSizes.11}/{lineHeights.12} {fonts.ui}',
  }),
}

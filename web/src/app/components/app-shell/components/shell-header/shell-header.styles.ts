import { css } from '@einbuergerungstest/design-system'

export const styles = {
  header: css.raw({
    gap: '8',
    '@media (max-width: 63.999rem)': {
      '&[data-compact-hidden]': { display: 'none' },
    },
    justifyContent: 'center',
    minHeight: '[3.625rem]',
    paddingBlock: '8',
    paddingInline: '20',
    background: 'panel.bg',
    borderBlockEnd: '{borderWidths.control} solid {colors.panel.border}',
    '@media (min-width: 48rem)': { minHeight: '[4.375rem]', paddingInline: '36' },
    '@media (min-width: 64rem)': {
      padding: '0',
      minHeight: '0',
      borderBlockEnd: 'none',
      // oxlint-disable-next-line @pandacss/prefer-composite-properties -- Preserve the one-sided gap; strict tokens cannot express a two-value paddingBlock.
      paddingBlockEnd: '32',
    },
  }),
  title: css({
    font: '{fontWeights.bold} {fontSizes.17}/{lineHeights.12} {fonts.ui}',
    overflowWrap: 'anywhere',
    '@media (min-width: 48rem)': { fontSize: '20' },
  }),
  region: css({
    display: 'none',
    '@media (min-width: 48rem)': { display: 'block' },
    color: 'content.muted',
    font: '{fontWeights.bold} {fontSizes.11}/{lineHeights.12} {fonts.ui}',
  }),
}

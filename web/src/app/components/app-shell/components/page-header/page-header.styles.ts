import { css } from '@einbuergerungstest/design-system'

export const styles = {
  hiddenHeading: css({ srOnly: true }),
  context: css.raw({
    display: 'none',
    '@media (min-width: 64rem)': {
      display: 'flex',
      placeItems: 'center normal',
      minHeight: 'shell.context',
      font: '{fontWeights.bold} {fontSizes.11}/{lineHeights.12} {fonts.ui}',
      color: 'content.muted',
    },
  }),
  heading: css({
    textStyle: 'compactTitle',
    '@media (min-width: 48rem)': { textStyle: 'title' },
    overflowWrap: 'anywhere',
    hyphens: 'auto',
  }),
  secondary: css.raw({
    gap: 'layout.section',
    '& a': { color: 'content.primary', textUnderlineOffset: '0.2em' },
  }),
}

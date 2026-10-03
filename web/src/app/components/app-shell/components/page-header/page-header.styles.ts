import { css } from '@einbuergerungstest/design-system'

export const styles = {
  header: css.raw({ '&[data-hidden]': { srOnly: true } }),
  hiddenHeading: css({ srOnly: true }),
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

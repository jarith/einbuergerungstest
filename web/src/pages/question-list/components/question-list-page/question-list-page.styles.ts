import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ minWidth: '0', overflowWrap: 'anywhere', hyphens: 'auto' }),
  heading: css({
    textStyle: 'compactHeading',
    '@media (min-width: 48rem)': { textStyle: 'heading' },
  }),
  muted: css({ textStyle: 'caption', color: 'content.muted' }),
  rows: css.raw({ listStyle: 'none', padding: '0', gap: '0' }),
  panel: css({ padding: '8' }),
}

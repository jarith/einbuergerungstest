import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ minWidth: '0', overflowWrap: 'anywhere', hyphens: 'auto', maxWidth: '[56rem]' }),
  heading: css({
    textStyle: 'compactHeading',
    '@media (min-width: 48rem)': { textStyle: 'heading' },
  }),
  eyebrow: css({ textStyle: 'overline', textTransform: 'uppercase' }),
  muted: css({ textStyle: 'caption', color: 'content.muted' }),
  history: css.raw({ listStyle: 'none', padding: '0', gap: '16' }),
  entry: css.raw({
    paddingBlockEnd: '16',
    '&:not(:last-child)': {
      borderBlockEnd: '{borderWidths.control} solid {colors.panel.border}',
    },
    gap: '8',
  }),
}

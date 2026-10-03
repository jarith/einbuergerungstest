import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  columns: css.raw({
    gap: '24',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 64rem)': {
      gridTemplateColumns: 'minmax(0, 3.6fr) minmax(0, 1fr)',
      gap: '32',
    },
  }),
  summary: css.raw({
    minWidth: '0',
    '@media (min-width: 64rem)': { gridColumn: '2', gridRow: '1' },
  }),
  question: css.raw({
    minWidth: '0',
    '@media (min-width: 64rem)': { gridColumn: '1', gridRow: '1' },
  }),
  eyebrow: css({ textStyle: 'overline', textTransform: 'uppercase' }),
  score: css({ textStyle: 'compactScore', '@media (min-width: 48rem)': { textStyle: 'title' } }),
  heading: css({
    fontSize: '22',
    fontWeight: 'bold',
    lineHeight: '22',
    '@media (min-width: 48rem)': {
      fontSize: '20',
      fontWeight: 'semibold',
      lineHeight: '20',
    },
  }),
  muted: css({ textStyle: 'caption', color: 'content.muted' }),
}

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
  controls: css.raw({
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '8',
  }),
  summary: css({
    '@media (max-width: 63.999rem)': { padding: '0', border: 'none', background: 'transparent' },
  }),
  desktop: css({ display: 'none', '@media (min-width: 64rem)': { display: 'block' } }),
  count: css({ textStyle: 'caption', textAlign: 'center' }),
  eyebrow: css({ textStyle: 'overline', textTransform: 'uppercase' }),
  title: css({ textStyle: 'heading' }),
  heading: css({ textStyle: 'heading' }),
  muted: css({ textStyle: 'caption', color: 'content.muted' }),
  timer: css({ fontVariantNumeric: 'tabular-nums' }),
}

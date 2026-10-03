import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  columns: css.raw({
    gap: '24',
    gridTemplateColumns: 'minmax(0, 1fr)',
  }),
  controls: css.raw({
    gridTemplateColumns: 'auto auto',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8',
  }),
  summary: css({ padding: '0', border: 'none', background: 'transparent' }),
  desktop: css({ display: 'none', '@media (min-width: 64rem)': { display: 'block' } }),
  eyebrow: css({ textStyle: 'overline', textTransform: 'uppercase' }),
  heading: css({ textStyle: 'heading' }),
  muted: css({ textStyle: 'caption', color: 'content.muted' }),
  timer: css({ fontVariantNumeric: 'tabular-nums' }),
}

import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  scope: css.raw({ textStyle: 'overline', textTransform: 'uppercase' }),
  columns: css.raw({
    gap: '32',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 64rem)': {
      gridTemplateColumns: 'minmax(0, 2.8fr) minmax(0, 1fr)',
      gap: '[3.5rem]',
    },
  }),
  help: css({ display: 'none', '@media (min-width: 64rem)': { display: 'block' } }),
  heading: css({ textStyle: 'heading' }),
  label: css({ textStyle: 'controlLabel' }),
  link: css({ color: 'content.primary' }),
}

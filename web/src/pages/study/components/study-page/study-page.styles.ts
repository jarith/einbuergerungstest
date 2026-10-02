import { css } from '@einbuergerungstest/design-system'

export const styles = {
  scope: css.raw({ textStyle: 'overline', textTransform: 'uppercase' }),
  columns: css.raw({
    gap: '32',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 64rem)': { gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 1fr)' },
  }),
  help: css({ display: 'none', '@media (min-width: 64rem)': { display: 'block' } }),
  heading: css({ textStyle: 'heading' }),
  label: css({ textStyle: 'controlLabel' }),
  link: css({ color: 'content.primary' }),
}

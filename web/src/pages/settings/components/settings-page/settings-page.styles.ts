import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({
    maxWidth: '[47.5rem]',
    overflowWrap: 'anywhere',
    hyphens: 'auto',
    '@media (min-width: 64rem)': { maxWidth: '[none]' },
  }),
  columns: css.raw({
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }),
  heading: css({ textStyle: 'heading' }),
  label: css({ textStyle: 'controlLabel' }),
  helper: css({ textStyle: 'choiceDescription', color: 'content.muted' }),
}

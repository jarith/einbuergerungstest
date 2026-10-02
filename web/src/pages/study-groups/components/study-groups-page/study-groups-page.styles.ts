import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  link: css({
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'start',
    gap: '8',
    minHeight: 'control.action',
    color: 'accent',
    textStyle: 'actionLabel',
    '& svg': { width: 'icon.action', height: 'icon.action', flexShrink: '0' },
  }),
  groups: css.raw({
    listStyle: 'none',
    padding: '0',
    gap: '0',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 48rem)': {
      columnGap: '32',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridTemplateRows: 'repeat(7, auto)',
      gridAutoFlow: 'column',
    },
  }),
}

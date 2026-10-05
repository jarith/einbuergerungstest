import { css } from '@einbuergerungstest/design-system'

export const styles = {
  summary: css({ color: 'content.muted' }),
  list: css.raw({ listStyle: 'none', padding: '0' }),
  row: css.raw({
    gridTemplateColumns: '0.625rem minmax(0, 1fr) 1.75rem 2.5rem',
    gap: '8',
    alignItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  }),
  dot: css({
    width: '[0.625rem]',
    height: '[0.625rem]',
    borderRadius: '[50%]',
    backgroundColor: 'currentColor',
  }),
  count: css({ textAlign: 'end', fontWeight: 'semibold' }),
  percentage: css({ textAlign: 'end', color: 'content.muted', whiteSpace: 'nowrap' }),
}

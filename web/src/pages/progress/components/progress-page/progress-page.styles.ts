import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ minWidth: '0', overflowWrap: 'anywhere', hyphens: 'auto' }),
  columns: css.raw({
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '32',
    '@media (min-width: 64rem)': { gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' },
  }),
  totals: css.raw({
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12',
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  }),
  panel: css({ padding: '12', gap: '8' }),
  count: css({ fontSize: '30', fontWeight: 'semibold' }),
  heading: css({ textStyle: 'heading' }),
  muted: css({ textStyle: 'caption', color: 'content.muted' }),
  list: css.raw({ listStyle: 'none', padding: '0', gap: '0' }),
  row: css({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12',
    paddingBlock: '12',
    color: 'content.primary',
    textDecoration: 'none',
    borderBlockEnd: 'hairline solid',
    borderColor: 'panel.border',
    _hover: { backgroundColor: 'surface-muted' },
    _focusVisible: {
      outline: '{borderWidths.focus} solid {colors.focus.outer}',
      outlineOffset: 'focus.offset',
    },
  }),
  prompt: css({ textStyle: 'controlLabel', lineClamp: 2 }),
  link: css({
    color: 'content.primary',
    minHeight: '[2.75rem]',
    display: 'inline-flex',
    alignItems: 'center',
  }),
}

import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ minWidth: '0', overflowWrap: 'anywhere', hyphens: 'auto' }),
  columns: css.raw({
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '32',
    '@media (min-width: 64rem)': { gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' },
  }),
  panel: css({ padding: '12', gap: '8' }),
  heading: css({
    textStyle: 'compactHeading',
    '@media (min-width: 48rem)': { textStyle: 'heading' },
  }),
  muted: css({
    textStyle: 'caption',
    fontSize: '14',
    color: 'content.muted',
  }),
  list: css.raw({ listStyle: 'none', padding: '0', gap: '0' }),
  row: css({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12',
    paddingBlock: '12',
    color: 'content.primary',
    textDecoration: 'none',
    fontSize: '14',
    '@media (min-width: 48rem)': { fontSize: '16' },
    borderBlockEnd: '{borderWidths.control} solid {colors.panel.border}',
    _hover: { backgroundColor: 'surface-muted' },
    _focusVisible: {
      outline: '{borderWidths.focus} solid {colors.focus.outer}',
      outlineOffset: 'focus.offset',
    },
  }),
  prompt: css({
    textStyle: 'controlLabel',
    fontSize: '14',
    lineClamp: 2,
  }),
  backup: css({ maxWidth: '[47.5rem]' }),
  link: css({
    color: 'content.primary',
    minHeight: '[2.75rem]',
    display: 'inline-flex',
    alignItems: 'center',
  }),
}

import { css, stack } from '@einbuergerungstest/design-system'

const rowCss = css.raw({
  paddingBlock: '12',
  paddingInline: '8',
  borderRadius: 'control',
  color: 'content.primary',
  textDecoration: 'none',
  fontSize: '14',
  '@media (min-width: 48rem)': { fontSize: '16' },
  _hover: { backgroundColor: 'surface-muted' },
  _focusVisible: {
    outline: '{borderWidths.focus} solid {colors.focus.outer}',
    outlineOffset: 'focus.offset',
  },
})

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
  list: css.raw({
    listStyle: 'none',
    padding: '0',
    gap: '0',
    '& > li + li': {
      borderBlockStart: '{borderWidths.control} solid {colors.panel.border}',
    },
  }),
  row: css(rowCss, {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12',
  }),
  questionRow: css(rowCss, stack.raw({ gap: '8' })),
  imageNote: css.raw({ alignItems: 'center', gap: '8', '& svg': { flexShrink: '0' } }),
  prompt: css({
    textStyle: 'controlLabel',
    fontSize: '14',
    lineClamp: 2,
  }),
}

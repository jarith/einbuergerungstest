import { css } from '@einbuergerungstest/design-system'

export const styles = {
  link: css({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) fit-content(35%)',
    alignItems: 'center',
    minHeight: '[3.5rem]',
    gap: '8',
    padding: '8',
    borderRadius: 'control',
    color: 'content.primary',
    textDecoration: 'none',
    '&:hover': { backgroundColor: 'surface-muted' },
    '&:focus-visible': {
      outline: '{borderWidths.focus} solid {colors.focus.outer}',
      outlineOffset: 'focus.offset',
    },
    'li:nth-child(even) &': { backgroundColor: 'surface-muted' },
  }),
  number: css({
    backgroundColor: 'surface-muted',
    padding: '8',
    borderRadius: 'control',
    textStyle: 'controlLabel',
    alignSelf: 'center',
    minWidth: '[2rem]',
    textAlign: 'center',
  }),
  content: css.raw({ minWidth: '0', gap: '0' }),
  prompt: css({ textStyle: 'controlLabel', lineClamp: 1 }),
  meta: css.raw({ gap: '8', alignItems: 'center', justifyContent: 'space-between' }),
  muted: css({ textStyle: 'choiceDescription', color: 'content.muted' }),
}

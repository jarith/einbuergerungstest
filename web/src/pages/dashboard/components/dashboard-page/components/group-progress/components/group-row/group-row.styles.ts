import { css } from '@einbuergerungstest/design-system'

export const styles = {
  row: css.raw({
    position: 'relative',
    minWidth: '0',
    gap: '8',
    paddingBlock: '16',
    '&:not(:last-child)': {
      borderBlockEnd: '{borderWidths.control} solid {colors.surface-raised}',
    },
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateAreas: '"identity" "controls"',
    '@media (min-width: 48rem)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 13.5rem)',
      gridTemplateAreas: '"identity controls"',
      columnGap: '24',
      alignItems: 'center',
    },
    '@media (min-width: 80rem)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 27.5rem)',
    },
  }),
  identity: css.raw({ gridArea: 'identity' }),
  title: css({ fontSize: '18', fontWeight: 'semibold', lineHeight: '18' }),
  description: css({ textStyle: 'caption', color: 'content.muted' }),
  metadata: css({ textStyle: 'caption', color: 'content.muted' }),
  percentage: css({
    fontSize: '14',
    fontWeight: 'semibold',
    flexShrink: '0',
    '@media (min-width: 48rem)': { fontSize: '20' },
  }),
  controls: css.raw({
    gridArea: 'controls',
    minWidth: '0',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12',
    alignItems: 'center',
    '@media (min-width: 48rem)': { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' },
    '@media (min-width: 80rem)': {
      gridTemplateColumns: 'minmax(0, 13.5rem) minmax(0, 12.5rem)',
      gap: '24',
    },
  }),
  progress: css.raw({ flex: '[1 1 10rem]' }),
  resume: css({
    textStyle: 'caption',
    color: 'content.muted',
  }),
  action: css({
    '@media (pointer: coarse)': {
      position: 'static',
      overflow: 'visible',
      _active: { transform: 'none' },
      _after: {
        content: '""',
        position: 'absolute',
        inset: '0',
      },
    },
    textStyle: 'controlLabel',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingInline: '8',
    minHeight: 'control.field',
    '@media (min-width: 48rem)': {
      width: '[100%]',
      borderColor: 'action.outline.border',
      backgroundColor: 'action.outline.bg',
      paddingInline: 'control.inline',
    },
  }),
}

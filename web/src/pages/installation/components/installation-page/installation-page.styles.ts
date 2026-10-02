import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  eyebrow: css({ textStyle: 'caption' }),
  title: css({ textStyle: 'title' }),
  heading: css({ textStyle: 'heading' }),
  columns: css.raw({
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '32',
    alignItems: 'start',
    '@media (min-width: 64rem)': { gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' },
  }),
  steps: css.raw({ listStyle: 'none', padding: '0', gap: '12' }),
  step: css.raw({
    alignItems: 'center',
    gap: '16',
    padding: '16',
    borderWidth: 'control',
    borderStyle: 'solid',
    borderColor: 'panel.border',
    borderRadius: 'panel',
  }),
  number: css({
    backgroundColor: 'accent',
    color: 'accent-foreground',
    fontWeight: 'semibold',
    borderRadius: 'control',
    padding: '8',
    minWidth: '[2.25rem]',
    textAlign: 'center',
    flexShrink: '0',
  }),
  stepTitle: css({ textStyle: 'controlLabel' }),
  helper: css({ textStyle: 'caption', color: 'content.muted' }),
  icon: css({ color: 'accent', width: 'icon.action', height: 'icon.action' }),
}

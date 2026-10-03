import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  eyebrow: css({ textStyle: 'caption' }),
  title: css({
    textStyle: 'compactTitle',
    '@media (min-width: 48rem)': { textStyle: 'installationTitle', fontSize: '38' },
    '@media (min-width: 64rem)': { fontSize: '42' },
  }),
  heading: css({
    textStyle: 'compactHeading',
    '@media (min-width: 48rem)': { textStyle: 'installationHeading' },
  }),
  transferHeading: css({
    textStyle: 'compactSubheading',
    '@media (min-width: 48rem)': { textStyle: 'installationTransferHeading' },
  }),
  columns: css.raw({
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '32',
    alignItems: 'start',
    '@media (min-width: 64rem)': { gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' },
  }),
  steps: css.raw({ listStyle: 'none', padding: '0', gap: '12' }),
  step: css.raw({
    alignItems: 'center',
    gap: '10',
    paddingBlock: '8',
    paddingInline: '10',
    '@media (min-width: 48rem)': { gap: '16', paddingBlock: '16', paddingInline: '16' },
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
    padding: '4',
    minWidth: '[1.75rem]',
    '@media (min-width: 48rem)': { padding: '8', minWidth: '[2.25rem]' },
    textAlign: 'center',
    flexShrink: '0',
  }),
  stepTitle: css({
    textStyle: 'compactStepTitle',
    '@media (min-width: 48rem)': { textStyle: 'installationStepTitle' },
  }),
  stepHelp: css({
    textStyle: 'compactStepHelp',
    color: 'content.muted',
    '@media (min-width: 48rem)': { textStyle: 'caption' },
  }),
  helper: css({
    textStyle: 'choiceDescription',
    color: 'content.muted',
    '@media (min-width: 48rem)': { textStyle: 'caption' },
  }),
  icon: css({ color: 'accent', width: 'icon.action', height: 'icon.action' }),
}

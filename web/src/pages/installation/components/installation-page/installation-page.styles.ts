import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ overflowWrap: 'anywhere', hyphens: 'auto' }),
  eyebrow: css({ textStyle: 'caption' }),
  title: css({
    textStyle: 'compactTitle',
    '@media (min-width: 48rem)': { textStyle: 'installationTitle' },
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
  step: css.raw({ alignItems: 'start', gap: '16', paddingBlock: '8' }),
  number: css({
    color: 'content.primary',
    fontWeight: 'semibold',
    minWidth: '[1.75rem]',
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

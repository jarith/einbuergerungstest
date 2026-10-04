import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ containerType: 'inline-size' }),
  columns: css.raw({
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '32',
    alignItems: 'start',
    '@container (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }),
  heading: css({
    textStyle: 'compactHeading',
    '@media (min-width: 48rem)': { textStyle: 'installationHeading' },
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
}

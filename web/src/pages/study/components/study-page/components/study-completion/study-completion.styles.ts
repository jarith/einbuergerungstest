import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({
    '&[data-animate=true]': {
      animation: 'completionIn {durations.completion} {easings.enter}',
      '& svg': { animation: 'completionCheck {durations.reveal} {easings.enter}' },
    },
  }),
  title: css({
    textStyle: 'compactTitle',
    '@media (min-width: 48rem)': { textStyle: 'title' },
  }),
  reached: css({ fontSize: '18', fontWeight: 'semibold', lineHeight: '18' }),
  explanation: css({ textStyle: 'caption', color: 'content.muted' }),
  check: css({
    color: 'success',
    flexShrink: '0',
  }),
}

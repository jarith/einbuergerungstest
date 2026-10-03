import { css } from '@einbuergerungstest/design-system'

export const styles = {
  heading: css({
    textStyle: 'compactDetailHeading',
    '@media (min-width: 48rem)': { textStyle: 'heading' },
  }),
  date: css({
    textStyle: 'compactCaption',
    color: 'content.muted',
    '@media (min-width: 48rem)': { textStyle: 'caption' },
  }),
  answer: css({
    textStyle: 'compactBody',
    '@media (min-width: 48rem)': { textStyle: 'body' },
  }),
}

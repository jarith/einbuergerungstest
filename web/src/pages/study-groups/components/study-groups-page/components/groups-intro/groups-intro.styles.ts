import { css } from '@einbuergerungstest/design-system'

export const styles = {
  eyebrow: css({ textStyle: 'overline', color: 'accent' }),
  title: css({
    textStyle: 'title',
    fontSize: '28',
    '@media (min-width: 48rem)': { fontSize: '42' },
  }),
  description: css({ textStyle: 'choiceDescription', color: 'content.muted' }),
  summary: css({ textStyle: 'controlLabel' }),
}

import { css } from '@einbuergerungstest/design-system'

export const styles = {
  title: css({
    textStyle: 'compactTitle',
    '@media (min-width: 48rem)': { textStyle: 'title' },
  }),
  reached: css({ fontSize: '24', fontWeight: 'bold', lineHeight: '24' }),
}

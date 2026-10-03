import { css } from '@einbuergerungstest/design-system'

export const styles = {
  title: css({
    textStyle: 'compactTitle',
    '@media (min-width: 48rem)': { textStyle: 'title' },
  }),
  reached: css({ fontSize: '18', fontWeight: 'semibold', lineHeight: '18' }),
  explanation: css({ textStyle: 'caption', color: 'content.muted' }),
  check: css({ color: 'success', flexShrink: '0' }),
}

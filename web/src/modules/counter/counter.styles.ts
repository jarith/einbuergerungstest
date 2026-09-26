import { css, toolbar } from '@app/design-system'

export const counterStyles = {
  content: css({ display: 'grid', gap: '24' }),
  heading: css({ textStyle: 'heading', margin: '0' }),
  label: css({ color: 'content.muted', margin: '0' }),
  value: css({ textStyle: 'title', fontVariantNumeric: 'tabular-nums' }),
  actions: toolbar(),
}

import { css } from '@einbuergerungstest/design-system'

export const questionTitle = css({
  fontSize: '22',
  '@media (min-width: 48rem)': { fontSize: '29' },
  '@media (min-width: 64rem)': { fontSize: '30' },
  fontWeight: 'emphasized',
  lineHeight: '32',
  color: 'content.primary',
  overflowWrap: 'anywhere',
})

export const translationText = css({
  fontSize: '15',
  lineHeight: '15',
  color: 'content.muted',
})

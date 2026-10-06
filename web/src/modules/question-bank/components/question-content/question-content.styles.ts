import { css } from '@einbuergerungstest/design-system'

export const feedbackAnnouncement = css({ srOnly: true })

export const questionTitle = css({
  fontSize: '24',
  '@media (min-width: 48rem)': { fontSize: '28' },
  fontWeight: 'emphasized',
  lineHeight: '32',
  color: 'content.primary',
  overflowWrap: 'anywhere',
})

export const reviewTitle = css({
  textStyle: 'compactHeading',
  fontSize: '24',
  '@media (min-width: 48rem)': { fontSize: '28' },
  color: 'content.primary',
  overflowWrap: 'anywhere',
})

export const translationText = css({
  fontSize: '14',
  lineHeight: '15',
  color: 'content.muted',
})

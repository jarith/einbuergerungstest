import { css } from '@einbuergerungstest/design-system'

export const questionImage = css({
  display: 'block',
  width: '[100%]',
  height: 'auto',
  objectFit: 'contain',
  borderRadius: 'field',
  '@media (min-width: 64rem)': { maxHeight: '[400px]' },
})

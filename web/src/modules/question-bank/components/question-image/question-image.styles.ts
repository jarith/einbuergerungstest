import { css } from '@einbuergerungstest/design-system'

export const questionImage = css({
  display: 'block',
  width: '[100%]',
  height: 'auto',
  objectFit: 'contain',
  borderRadius: 'field',
})

export const imageViewport = css({
  overflow: 'auto',
  maxHeight: '[55dvh]',
  borderRadius: 'field',
  '& img': { display: 'block', height: 'auto', maxWidth: '[none]', width: '[100%]' },
  '&[data-zoom="2"] img': { width: '[200%]' },
  '&[data-zoom="3"] img': { width: '[300%]' },
})

import { css } from '@einbuergerungstest/design-system'

export const recoveryLayoutCss = css.raw({
  minHeight: 'dvh',
  // Halving this reduced area places the block 200px above the viewport center.
  '@media (min-width: 48rem)': { minHeight: '[calc(100dvh - 400px)]' },
})

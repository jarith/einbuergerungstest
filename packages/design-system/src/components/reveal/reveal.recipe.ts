import { defineSlotRecipe } from '@pandacss/dev'

export const revealRecipe = defineSlotRecipe({
  className: 'ds-reveal',
  slots: ['root', 'content'],
  base: {
    root: {
      display: 'grid',
      gridTemplateRows: '0fr',
      opacity: 0,
      visibility: 'hidden',
      transition:
        'grid-template-rows {durations.feedback} {easings.enter}, opacity {durations.feedback} {easings.enter}, visibility {durations.feedback}',
    },
    content: { display: 'block', minHeight: '0', overflow: 'hidden' },
  },
  variants: {
    opened: {
      true: {
        root: {
          gridTemplateRows: '1fr',
          opacity: 1,
          visibility: 'visible',
          transitionDuration: 'reveal',
        },
      },
    },
  },
})

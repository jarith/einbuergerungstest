import { defineSlotRecipe } from '@pandacss/dev'

export const progressBarRecipe = defineSlotRecipe({
  className: 'ds-progress-bar',
  slots: ['root', 'section', 'label'],
  base: {
    root: {
      height: 'progress.track',
      backgroundColor: 'progress.track',
      borderRadius: 'progress',
      overflow: 'hidden',
    },
    section: { backgroundColor: 'progress.fill', borderRadius: 'progress' },
  },
})

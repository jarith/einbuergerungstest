import { cva } from '@einbuergerungstest/design-system'

export const progressStatus = cva({
  variants: {
    status: {
      'not-started': { color: 'grey0' },
      'needs-review': { color: 'danger' },
      learning: { color: 'orange' },
      learned: { color: 'success' },
    },
  },
})

import { action, atom, computed } from '@reatom/core'

import type { LearningStatus } from '../../../../../../modules/learner-state'

export const createProgressHighlight = () => {
  const selected = atom<LearningStatus | null>(null, 'dashboard.highlight.selected')
  const preview = atom<LearningStatus | null>(null, 'dashboard.highlight.preview')

  return computed(() => preview() ?? selected(), 'dashboard.highlight').extend(() => ({
    selected,
    preview: action((status: LearningStatus | null) => {
      preview.set(status)
    }, 'dashboard.highlight.previewStatus'),
    toggle: action((status: LearningStatus) => {
      selected.set(selected() === status ? null : status)

      preview.set(null)
    }, 'dashboard.highlight.toggle'),
    clear: action(() => {
      selected.set(null)

      preview.set(null)
    }, 'dashboard.highlight.clear'),
  }))
}

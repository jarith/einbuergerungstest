import type { QuestionTotals } from '../../../modules/learner-state'

const statuses = ['not-started', 'needs-review', 'learning', 'learned'] as const

export const getStatusSegments = (totals: QuestionTotals) =>
  statuses.map((status, index) => ({
    status,
    count: totals.statuses[status],
    portion: totals.total === 0 ? 0 : totals.statuses[status] / totals.total,
    offset:
      totals.total === 0
        ? 0
        : statuses
            .slice(0, index)
            .reduce((count, previous) => count + totals.statuses[previous], 0) / totals.total,
  }))

export type StatusSegment = ReturnType<typeof getStatusSegments>[number]

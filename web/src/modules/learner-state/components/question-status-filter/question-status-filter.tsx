import type { TFunction } from 'i18next'
import { SegmentedChoice } from '@einbuergerungstest/design-system'

import type { LearningStatus, QuestionTotals } from '../../domain/question-progress'

type QuestionStatusFilterProps = Readonly<{
  value: 'all' | LearningStatus
  totals: QuestionTotals
  onChange: (value: 'all' | LearningStatus) => void
  t: TFunction
}>

const filters = ['all', 'not-started', 'needs-review', 'learning', 'learned'] as const

export const QuestionStatusFilter = ({ value, totals, onChange, t }: QuestionStatusFilterProps) => (
  <SegmentedChoice
    aria-label={t('questions.filter')}
    value={value}
    data={filters.map((filter) => ({
      value: filter,
      label: t('questions.filterCount', {
        status: t(filter === 'all' ? 'questions.all' : `progress.${filter}`),
        count: filter === 'all' ? totals.total : totals.statuses[filter],
      }),
    }))}
    onChange={(next) => {
      const filter = filters.find((candidate) => candidate === next)

      if (filter !== undefined) {
        onChange(filter)
      }
    }}
  />
)

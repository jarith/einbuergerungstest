import { Button } from '@einbuergerungstest/design-system'
import { Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { QuestionListModel } from '../../../../question-list.model'

type QuestionFiltersProps = Readonly<{ model: QuestionListModel }>

const filters = [
  { value: 'all', label: 'questions.all' },
  { value: 'not-started', label: 'progress.notStarted' },
  { value: 'needs-review', label: 'progress.needsReview' },
  { value: 'learning', label: 'progress.learning' },
  { value: 'learned', label: 'progress.learned' },
] as const

export const QuestionFilters = reatomComponent(({ model }: QuestionFiltersProps) => {
  const t = model.localization.t()
  const totals = model.totals()

  return (
    <Wrap
      as="fieldset"
      gap="8"
      border="none"
      padding="0"
      minWidth="0"
      aria-label={t('questions.filter')}
    >
      {filters.map((filter) => (
        <Button
          key={filter.value}
          appearance={model.filter() === filter.value ? 'solid' : 'outline'}
          aria-pressed={model.filter() === filter.value}
          onClick={wrap(() => model.setFilter(filter.value))}
        >
          {t(filter.label)} ·{' '}
          {filter.value === 'all' ? totals.total : totals.statuses[filter.value]}
        </Button>
      ))}
    </Wrap>
  )
}, 'QuestionFilters')

import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { QuestionListModel } from '../../../../question-list.model'
import { QuestionStatusFilter } from '../../../../../../modules/learner-state'

type QuestionFiltersProps = Readonly<{ model: QuestionListModel }>

export const QuestionFilters = reatomComponent(
  ({ model }: QuestionFiltersProps) => (
    <QuestionStatusFilter
      value={model.filter()}
      totals={model.totals()}
      onChange={wrap(model.setFilter)}
      t={model.localization.t()}
    />
  ),
  'QuestionFilters',
)

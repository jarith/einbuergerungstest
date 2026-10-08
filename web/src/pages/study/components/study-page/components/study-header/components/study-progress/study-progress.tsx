import type { TFunction } from 'i18next'
import { memo } from 'react'

import type { QuestionTotals } from '../../../../../../../../modules/learner-state'
import { QuestionStatusBar } from '../../../../../../../../modules/learner-state'

type StudyProgressProps = Readonly<{
  totals: QuestionTotals
  title: string
  percentageLabel: string
  t: TFunction
}>

export const StudyProgress = memo(
  ({ totals, title, percentageLabel, t }: StudyProgressProps) => (
    <QuestionStatusBar group={{ ...totals, title, percentageLabel }} t={t} />
  ),
  (before, after) =>
    before.t === after.t &&
    before.title === after.title &&
    before.percentageLabel === after.percentageLabel &&
    before.totals.total === after.totals.total &&
    before.totals.contributing === after.totals.contributing &&
    before.totals.percentage === after.totals.percentage &&
    before.totals.attemptCount === after.totals.attemptCount &&
    (['not-started', 'needs-review', 'learning', 'learned'] as const).every(
      (status) => before.totals.statuses[status] === after.totals.statuses[status],
    ),
)

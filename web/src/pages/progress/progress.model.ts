import { action, atom, computed } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { LearningStatus } from '../../modules/learner-state'
import { createBackupModel } from '../../modules/learner-state'
import { getQuestionKey } from '../../modules/question-bank'

type ProgressFilter = 'all' | LearningStatus

export const createProgressPageModel = (resources: AppResources) => {
  const { learner, localization, questions } = resources
  const filter = atom<ProgressFilter>('all', 'progressPage.filter')

  const recent = computed(() => {
    const progress = learner.progress.questions()
    const status = filter()

    return questions.bank.questions
      .flatMap((question) => {
        const key = getQuestionKey(question)
        const history = progress.get(key)

        return history === undefined || (status !== 'all' && history.status !== status)
          ? []
          : [{ question, key, history, href: `/progress/questions/${encodeURIComponent(key)}` }]
      })
      .toSorted(
        (left, right) =>
          (right.history.lastAttempt?.answeredAt ?? 0) -
          (left.history.lastAttempt?.answeredAt ?? 0),
      )
      .slice(0, 4)
  }, 'progressPage.recent')

  return recent.extend(() => ({
    localization,
    filter,
    totals: learner.progress.totals,
    mockTotals: learner.progress.mockTotals,
    mocks: computed(
      () =>
        learner.progress
          .mocks()
          .filter((mock) => mock.status !== 'active')
          .toReversed(),
      'progressPage.mocks',
    ),
    backup: createBackupModel(learner),
    setFilter: action((status: ProgressFilter) => filter.set(status), 'progressPage.setFilter'),
  }))
}

export type ProgressPageModel = ReturnType<typeof createProgressPageModel>

export type ProgressData = AppResources & Readonly<{ model: ProgressPageModel }>

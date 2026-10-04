import { action, atom, computed } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { LearningStatus } from '../../modules/learner-state'
import { getQuestionKey } from '../../modules/question-bank'

type ProgressFilter = 'all' | LearningStatus

export const createProgressPageModel = (resources: AppResources) => {
  const { learner, localization, questions } = resources
  const pageSize = 10
  const filter = atom<ProgressFilter>('all', 'progressPage.filter')
  const limit = atom(pageSize, 'progressPage.limit')

  const filtered = computed(() => {
    const progress = learner.progress.questions()
    const status = filter()

    return questions.bank.questions.flatMap((question) => {
      const key = getQuestionKey(question)
      const history = progress.get(key)

      return history === undefined || (status !== 'all' && history.status !== status)
        ? []
        : [{ question, key, history, href: `/progress/questions/${encodeURIComponent(key)}` }]
    })
  }, 'progressPage.filtered')

  return computed(() => filtered().slice(0, limit()), 'progressPage.questions').extend(() => ({
    localization,
    pageSize,
    filter,
    total: computed(() => filtered().length, 'progressPage.total'),
    remaining: computed(() => Math.max(0, filtered().length - limit()), 'progressPage.remaining'),
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
    setFilter: action((status: ProgressFilter) => {
      filter.set(status)

      limit.set(pageSize)
    }, 'progressPage.setFilter'),
    showMore: action(() => limit.set(limit() + pageSize), 'progressPage.showMore'),
  }))
}

export type ProgressPageModel = ReturnType<typeof createProgressPageModel>

export type ProgressData = AppResources & Readonly<{ model: ProgressPageModel }>

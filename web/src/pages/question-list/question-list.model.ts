import { action, atom, computed } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { LearningStatus } from '../../modules/learner-state'
import { getQuestionKey } from '../../modules/question-bank'

type QuestionFilter = 'all' | LearningStatus

export const createQuestionListModel = (resources: AppResources) => {
  const filter = atom<QuestionFilter>('all', 'questionList.filter')
  const limit = atom(8, 'questionList.limit')
  const { learner, questions, localization } = resources

  const filtered = computed(() => {
    const progress = learner.progress.questions()
    const status = filter()

    return questions.bank.questions.flatMap((question) => {
      const key = getQuestionKey(question)
      const history = progress.get(key)

      if (history === undefined || (status !== 'all' && history.status !== status)) {
        return []
      }

      return [{ question, key, history, href: `/progress/questions/${encodeURIComponent(key)}` }]
    })
  }, 'questionList.filtered')

  return computed(() => filtered().slice(0, limit()), 'questionList').extend(() => ({
    localization,
    filter,
    total: computed(() => filtered().length, 'questionList.total'),
    totals: learner.progress.totals,
    remaining: computed(() => Math.max(0, filtered().length - limit()), 'questionList.remaining'),
    setFilter: action((status: QuestionFilter) => {
      filter.set(status)

      limit.set(8)
    }, 'questionList.setFilter'),
    showMore: action(() => limit.set(limit() + 8), 'questionList.showMore'),
  }))
}

export type QuestionListModel = ReturnType<typeof createQuestionListModel>

export type QuestionListData = AppResources & Readonly<{ model: QuestionListModel }>

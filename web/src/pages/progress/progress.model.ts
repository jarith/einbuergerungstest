import { action, atom, computed } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { LearningStatus } from '../../modules/learner-state'
import { getAppPath } from '../../app/offline/app-mode'
import { getQuestionKey } from '../../modules/question-bank'

type ProgressFilter = 'all' | LearningStatus

export const createProgressPageModel = (resources: AppResources) => {
  const { learner, localization, questions } = resources
  const pageSize = 10
  const filter = atom<ProgressFilter>('all', 'progressPage.filter')

  const expanded = atom(
    questions.bank.groups.slice(0, 2).map((group) => group.id),
    'progressPage.expanded',
  )

  const limits = atom<Readonly<Record<string, number>>>({}, 'progressPage.limits')

  const filtered = computed(() => {
    const progress = learner.progress.questions()
    const status = filter()

    return questions.bank.questions.flatMap((question) => {
      const key = getQuestionKey(question)
      const history = progress.get(key)

      return history === undefined || (status !== 'all' && history.status !== status)
        ? []
        : [
            {
              question,
              key,
              history,
              href: getAppPath(`/progress/questions/${encodeURIComponent(key)}`),
            },
          ]
    })
  }, 'progressPage.filtered')

  const groups = computed(() => {
    const rows = filtered()
    const progress = learner.progress.groups()
    const revealed = limits()

    return questions.bank.groups.map((group) => {
      const totals = progress.get(group.id)

      if (totals === undefined) {
        throw new Error(`Missing progress for question group ${group.id}.`)
      }

      const matches = rows.filter((row) => row.question.group_id === group.id)
      const limit = revealed[group.id] ?? pageSize

      return {
        ...localization.getGroup(group),
        ...totals,
        percentageLabel: localization.formatNumber(totals.percentage),
        matches: matches.length,
        rows: matches.slice(0, limit),
        remaining: Math.max(0, matches.length - limit),
      }
    })
  }, 'progressPage.groups')

  return filtered.extend(() => ({
    localization,
    pageSize,
    filter,
    expanded,
    groups,
    total: computed(() => filtered().length, 'progressPage.total'),
    matchingGroups: computed(
      () => groups().filter((group) => group.matches > 0).length,
      'progressPage.matchingGroups',
    ),
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

      limits.set({})
    }, 'progressPage.setFilter'),
    showMore: action(
      (groupId: string) =>
        limits.set((current) => ({
          ...current,
          [groupId]: (current[groupId] ?? pageSize) + pageSize,
        })),
      'progressPage.showMore',
    ),
  }))
}

export type ProgressPageModel = ReturnType<typeof createProgressPageModel>

export type ProgressGroup = ReturnType<ProgressPageModel['groups']>[number]

export type ProgressTab = 'question-status' | 'mock-tests'

export type ProgressData = AppResources &
  Readonly<{
    model: ProgressPageModel
    tab: ProgressTab
    selectTab: (tab: string | null) => void
  }>

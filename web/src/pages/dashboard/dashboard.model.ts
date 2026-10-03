import { computed, onLineAtom } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import { getQuestionKey } from '../../modules/question-bank'
import { getCalendarDaysUntil } from './lib/calendar-days'
import { getProgressPercentage } from './lib/progress-percentage'
import { createLocalDay } from './local-day.model'

export const createDashboardModel = (resources: AppResources) => {
  const { learner, localization, questions } = resources
  const localDay = createLocalDay()

  return computed(() => {
    const totals = learner.progress.totals()
    const percentage = getProgressPercentage(totals)

    return {
      ...totals,
      percentageLabel: localization.formatNumber(percentage.value, {
        maximumFractionDigits: percentage.fractionDigits,
      }),
    }
  }, 'dashboard').extend(() => ({
    localization,
    online: onLineAtom,
    offline: resources.offline,
    date: computed(() => {
      const date = learner()?.preferences.plannedTestDate

      if (date === undefined || date === null) {
        return null
      }
      const days = getCalendarDaysUntil(date, localDay())

      return days < 0 ? null : { days, label: localization.formatPlannedDate(date) }
    }, 'dashboard.date'),
    groups: computed(
      () =>
        questions.bank.groups.map((group) => {
          const progress = learner.progress.groups().get(group.id)

          if (progress === undefined) {
            throw new Error(`Missing progress for question group ${group.id}.`)
          }

          const position = learner()?.positions.groups[group.id]
          const percentage = getProgressPercentage(progress)

          const savedIndex = questions.bank.questions
            .filter((question) => question.group_id === group.id)
            .findIndex((question) => getQuestionKey(question) === position?.questionKey)

          return {
            ...localization.getGroup(group),
            ...progress,
            progressValue: percentage.value,
            percentageLabel: localization.formatNumber(percentage.value, {
              maximumFractionDigits: percentage.fractionDigits,
            }),
            href: `/study/groups/${encodeURIComponent(group.id)}`,
            resumePosition:
              position?.status === 'in-progress' && savedIndex >= 0 ? savedIndex + 1 : null,
            action:
              position === undefined
                ? 'groups.start'
                : position.status === 'completed'
                  ? 'groups.completed'
                  : 'groups.continue',
          } as const
        }),
      'dashboard.groups',
    ),
  }))
}

export type DashboardModel = ReturnType<typeof createDashboardModel>

export type DashboardData = AppResources & Readonly<{ dashboard: DashboardModel }>

export type DashboardGroup = ReturnType<DashboardModel['groups']>[number]

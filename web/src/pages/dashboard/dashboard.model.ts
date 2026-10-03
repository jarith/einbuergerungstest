import { computed, onLineAtom } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import { getCalendarDaysUntil } from './lib/calendar-days'
import { createLocalDay } from './local-day.model'

export const createDashboardModel = (resources: AppResources) => {
  const { learner, localization, questions } = resources
  const localDay = createLocalDay()

  return computed(() => learner.progress.totals(), 'dashboard').extend(() => ({
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

          return { ...localization.getGroup(group), ...progress }
        }),
      'dashboard.groups',
    ),
  }))
}

export type DashboardModel = ReturnType<typeof createDashboardModel>

export type DashboardData = AppResources & Readonly<{ dashboard: DashboardModel }>

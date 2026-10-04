import { effect, peek } from '@reatom/core'

import type { AppRoutes } from './app.route'
import type { AppRoute } from './routing'
import { createOrderedStudyAnalytics, observeProgressAnalytics } from '../modules/learner-state'
import { observeMockTestAnalytics } from '../modules/mock-test'
import { observeLocalizationAnalytics } from './i18n/localization.analytics'
import { getAppMode } from './offline/pwa.analytics'
import { startPageAnalytics } from './page.analytics'

export const startAppAnalytics = (route: AppRoute, routes: AppRoutes) => {
  const page = startPageAnalytics()
  const { analytics } = page
  const observeStudy = createOrderedStudyAnalytics(analytics)
  const usage = { hasUsedBrowser: false }
  const subscriptions: (() => void)[] = []

  analytics.run(() => {
    const resources = effect(() => {
      const data = route.loader.data()
      const cleanup: (() => void)[] = []

      peek(() =>
        analytics.run(() => {
          if (data === undefined) {
            return
          }

          cleanup.push(
            observeLocalizationAnalytics(data.learner, analytics),
            observeProgressAnalytics(data.learner, analytics),
            observeMockTestAnalytics(data.learner, analytics),
          )

          const browserUsed = (activity: 'study' | 'mock') => {
            if (!usage.hasUsedBrowser && getAppMode() === 'web') {
              usage.hasUsedBrowser = true

              analytics.track('browser_used', { activity })
            }
          }

          cleanup.push(
            data.learner.recordStudyAnswer.onFulfill.subscribe(() => {
              analytics.run(() => browserUsed('study'))
            }),
            data.learner.startMock.onFulfill.subscribe(() => {
              analytics.run(() => browserUsed('mock'))
            }),
            data.learner.selectMockAnswer.onFulfill.subscribe(() => {
              analytics.run(() => browserUsed('mock'))
            }),
          )
        }),
      )

      return () => cleanup.forEach((unsubscribe) => unsubscribe())
    }, 'analytics.resources')

    subscriptions.push(resources.unsubscribe)

    const study = effect(() => {
      const data = routes.study.groupStudy.exact()
        ? routes.study.groupStudy.loader.data()
        : routes.study.study.exact()
          ? routes.study.study.loader.data()
          : undefined

      const cleanup = peek(() =>
        analytics.run(() => {
          if (data !== undefined) {
            return observeStudy(
              data.model.session,
              data.model.flow().isInspection ? 'inspection' : 'sequential',
              data.group?.id ?? null,
              getAppMode,
            )
          }

          return undefined
        }),
      )

      return () => cleanup?.()
    }, 'analytics.orderedStudy')

    subscriptions.push(study.unsubscribe)
  })

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())

    page.dispose()
  }
}

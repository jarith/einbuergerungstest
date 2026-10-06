import type { ReactElement } from 'react'
import { reatomRoute } from '@reatom/core'

import { createStartupRecovery } from '../modules/learner-state'
import { createDashboardRoute } from '../pages/dashboard'
import { createMockTestRoutes } from '../pages/mock-test'
import { createProgressRoute } from '../pages/progress'
import { createQuestionHistoryRoute } from '../pages/question-history'
import { createSettingsRoute } from '../pages/settings'
import { createStudyRoutes } from '../pages/study'
import { createTestReviewRoute } from '../pages/test-review'
import { loadAppResources } from './bootstrap.model'
import { AppLayout } from './components/app-layout/app-layout'
import { getAppBase } from './offline/app-mode'
import { createPageTitleAtom } from './page-title.model'

export const appRoute = reatomRoute(
  {
    path: getAppBase(),
    layout: true,
    loader: loadAppResources,
    render: (self): ReactElement => (
      <AppLayout route={self} routes={routes} title={pageTitle} recovery={startupRecovery} />
    ),
  },
  'appRoute',
)

const startupRecovery = createStartupRecovery(appRoute.loader.error, () => {
  void appRoute.loader.retry()
})

export const routes = {
  dashboard: createDashboardRoute(appRoute),
  study: createStudyRoutes(appRoute),
  mock: createMockTestRoutes(appRoute),
  progress: createProgressRoute(appRoute),
  questionHistory: createQuestionHistoryRoute(appRoute),
  testReview: createTestReviewRoute(appRoute),
  settings: createSettingsRoute(appRoute),
}

export type AppRoutes = typeof routes

export const pageTitle = createPageTitleAtom(appRoute, routes)

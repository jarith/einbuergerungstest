import type { ReactElement } from 'react'
import { reatomRoute } from '@reatom/core'

import { createDashboardRoute } from '../pages/dashboard'
import { createInstallationRoute } from '../pages/installation'
import { createMockTestRoutes } from '../pages/mock-test'
import { createProgressRoute } from '../pages/progress'
import { createQuestionHistoryRoute } from '../pages/question-history'
import { createQuestionListRoute } from '../pages/question-list'
import { createSettingsRoute } from '../pages/settings'
import { createStudyRoutes } from '../pages/study'
import { createStudyGroupsRoute } from '../pages/study-groups'
import { createTestReviewRoute } from '../pages/test-review'
import { loadAppResources } from './bootstrap.model'
import { AppLayout } from './components/app-layout/app-layout'
import { createPageTitleAtom } from './page-title.model'

export const appRoute = reatomRoute(
  {
    layout: true,
    loader: loadAppResources,
    render: (self): ReactElement => <AppLayout route={self} routes={routes} title={pageTitle} />,
  },
  'appRoute',
)

export const routes = {
  dashboard: createDashboardRoute(appRoute),
  study: createStudyRoutes(appRoute),
  groups: createStudyGroupsRoute(appRoute),
  mock: createMockTestRoutes(appRoute),
  progress: createProgressRoute(appRoute),
  questions: createQuestionListRoute(appRoute),
  questionHistory: createQuestionHistoryRoute(appRoute),
  testReview: createTestReviewRoute(appRoute),
  settings: createSettingsRoute(appRoute),
  installation: createInstallationRoute(appRoute),
}

export type AppRoutes = typeof routes

const pageTitle = createPageTitleAtom(appRoute, routes)

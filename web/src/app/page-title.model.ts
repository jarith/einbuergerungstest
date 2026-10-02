import { computed } from '@reatom/core'

import type { AppRoutes } from './app.route'
import type { AppRoute } from './routing'

export const createPageTitleAtom = (appRoute: AppRoute, routes: AppRoutes) => {
  const pages = [
    { route: routes.dashboard, title: 'navigation.dashboard' },
    { route: routes.study.entry, title: 'navigation.study' },
    { route: routes.study.study, title: 'navigation.study' },
    { route: routes.study.groupEntry, title: 'navigation.groups' },
    { route: routes.study.groupStudy, title: 'navigation.groups' },
    { route: routes.groups, title: 'navigation.groups' },
    { route: routes.mock.entry, title: 'navigation.mockTest' },
    { route: routes.mock.question, title: 'navigation.mockTest' },
    { route: routes.progress, title: 'navigation.progress' },
    { route: routes.questions, title: 'navigation.questions' },
    { route: routes.questionHistory, title: 'navigation.questionHistory' },
    { route: routes.testReview, title: 'navigation.testReview' },
    { route: routes.settings, title: 'navigation.settings' },
    { route: routes.installation, title: 'navigation.installation' },
  ] as const

  return computed(() => {
    const t = appRoute.loader.data()?.localization.t()
    const page = pages.find(({ route }) => route.exact())

    const title =
      page === undefined || page.route.loader.error()?.name === 'PageNotFound'
        ? 'navigation.notFound'
        : page.title

    return t?.(title) ?? ''
  }, 'app.pageTitle')
}

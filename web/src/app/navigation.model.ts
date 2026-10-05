import { getThemeColor } from '@einbuergerungstest/design-system'
import { effect } from '@reatom/core'

import { browserNavigationAtom } from '../shared/navigation/browser-navigation.model'
import { appRoute, pageTitle, routes } from './app.route'

export const startNavigation = () =>
  browserNavigationAtom.start((destination) => {
    const data = appRoute.loader.data()
    const active = data?.learner()?.mockSittings.find((sitting) => sitting.status === 'active')

    if (data === undefined || active === undefined) {
      return null
    }

    const staysInPaper = active.answers.some(
      ({ questionKey }) =>
        destination.pathname === routes.mock.question.path({ testId: active.id, questionKey }),
    )

    if (
      staysInPaper ||
      destination.pathname === routes.mock.entry.path({ testId: undefined }) ||
      destination.pathname === routes.mock.entry.path({ testId: active.id })
    ) {
      return null
    }

    return { leave: () => data.learner.finishMock(active.id, 'unfinished') }
  })

export const startPageMetadata = () =>
  effect(() => {
    document.title = `${pageTitle() || 'Training'} · Einbürgerungstest Berlin`

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getThemeColor(appRoute.loader.data()?.localization.appearance() ?? 'light'),
      )
  }, 'app.pageMetadata')

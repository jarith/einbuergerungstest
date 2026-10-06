import type { ReactElement } from 'react'
import { action, computed, wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import type { ProgressTab } from './progress.model'
import { pageNotFound, RoutePage } from '../../app/routing'
import { browserNavigationAtom } from '../../shared/navigation/browser-navigation.model'
import { ProgressPage } from './components/progress-page/progress-page'
import { createProgressPageModel } from './progress.model'

type ProgressSearch = Readonly<{ tab?: ProgressTab }>

type ProgressSearchInput = Readonly<{ tab?: string }>

export const createProgressRoute = (parent: AppRoute) => {
  // Scope browsing state to the loaded learner, not a tab or question-history visit.
  const model = computed(() => {
    const resources = parent.loader.data()

    return resources === undefined ? undefined : createProgressPageModel(resources)
  }, 'progressRoute.model')

  const selectTab = action((tab: string | null) => {
    if ((tab === 'question-status' || tab === 'mock-tests') && tab !== route()?.tab) {
      browserNavigationAtom.withinPage(() => route.go({ tab }))
    }
  }, 'progressRoute.selectTab')

  const route = parent.reatomRoute(
    {
      path: 'progress',
      search: {
        decode: ({ tab }: ProgressSearchInput): ProgressSearch => {
          if (tab !== undefined && tab !== 'question-status' && tab !== 'mock-tests') {
            throw pageNotFound()
          }

          return { tab: tab ?? 'question-status' }
        },
        encode: ({ tab }: ProgressSearch) => (tab === 'mock-tests' ? { tab } : {}),
      },
      loader: async ({ tab }) => {
        const resources = await wrap(parent.loader())
        const pageModel = model()

        if (pageModel === undefined) {
          throw new Error('Progress is not available. Reload the page to try again.')
        }

        return { ...resources, model: pageModel, tab: tab ?? 'question-status', selectTab }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          keepPreviousData
          page={ProgressPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'progressRoute',
  )

  return route
}

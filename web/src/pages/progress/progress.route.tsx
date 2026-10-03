import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { ProgressPage } from './components/progress-page/progress-page'
import { createProgressPageModel } from './progress.model'

export const createProgressRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'progress',
      loader: async () => {
        const resources = await wrap(parent.loader())

        return { ...resources, model: createProgressPageModel(resources) }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={ProgressPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'progressRoute',
  )

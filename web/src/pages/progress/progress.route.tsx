import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { ProgressPage } from './components/progress-page/progress-page'

export const createProgressRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'progress',
      loader: async () => await wrap(parent.loader()),
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

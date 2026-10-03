import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { DashboardPage } from './components/dashboard-page/dashboard-page'
import { createDashboardModel } from './dashboard.model'

export const createDashboardRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: '',
      loader: async () => {
        const resources = await wrap(parent.loader())

        return { ...resources, dashboard: createDashboardModel(resources) }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={DashboardPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'dashboardRoute',
  )

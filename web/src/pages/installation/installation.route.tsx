import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { InstallationPage } from './components/installation-page/installation-page'

export const createInstallationRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'settings/installation',
      loader: async () => await wrap(parent.loader()),
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={InstallationPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'installationRoute',
  )

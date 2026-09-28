import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { SettingsPage } from './components/settings-page/settings-page'

export const createSettingsRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'settings',
      loader: async () => await wrap(parent.loader()),
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={SettingsPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'settingsRoute',
  )

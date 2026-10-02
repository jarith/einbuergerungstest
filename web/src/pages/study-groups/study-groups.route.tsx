import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { StudyGroupsPage } from './components/study-groups-page/study-groups-page'
import { createStudyGroupsModel } from './study-groups.model'

export const createStudyGroupsRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'study/groups',
      loader: async () => {
        const resources = await wrap(parent.loader())

        return { ...resources, groups: createStudyGroupsModel(resources) }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={StudyGroupsPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'studyGroupsRoute',
  )

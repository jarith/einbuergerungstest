import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { QuestionListPage } from './components/question-list-page/question-list-page'
import { createQuestionListModel } from './question-list.model'

export const createQuestionListRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'progress/questions',
      loader: async () => {
        const resources = await wrap(parent.loader())

        return { ...resources, model: createQuestionListModel(resources) }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={QuestionListPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'questionListRoute',
  )

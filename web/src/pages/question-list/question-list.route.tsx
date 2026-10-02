import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { QuestionListPage } from './components/question-list-page/question-list-page'

export const createQuestionListRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'progress/questions',
      loader: async () => await wrap(parent.loader()),
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

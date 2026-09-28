import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { pageNotFound, RoutePage } from '../../app/routing'
import { QuestionHistoryPage } from './components/question-history-page/question-history-page'

export const createQuestionHistoryRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'progress/questions/:questionKey',
      loader: async ({ questionKey }) => {
        const resources = await wrap(parent.loader())
        const selected = resources.questions.getQuestion(questionKey)

        if (selected === undefined) {
          throw pageNotFound()
        }

        return { ...resources, selected }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={QuestionHistoryPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'questionHistoryRoute',
  )

export type QuestionHistoryData = Awaited<
  ReturnType<ReturnType<typeof createQuestionHistoryRoute>['loader']>
>

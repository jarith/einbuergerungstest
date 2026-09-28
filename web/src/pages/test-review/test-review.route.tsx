import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { pageNotFound, RoutePage } from '../../app/routing'
import { TestReviewPage } from './components/test-review-page/test-review-page'

export const createTestReviewRoute = (parent: AppRoute) =>
  parent.reatomRoute(
    {
      path: 'progress/tests/:testId',
      loader: async ({ testId }) => {
        const resources = await wrap(parent.loader())
        const sitting = resources.learner()?.mockSittings.find((item) => item.id === testId)

        if (sitting === undefined || sitting.status === 'active') {
          throw pageNotFound()
        }

        const paper = sitting.answers.map((answer) => {
          const selected = resources.questions.getQuestion(answer.questionKey)

          if (selected === undefined) {
            throw pageNotFound()
          }

          return selected
        })

        return { ...resources, testId, paper }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={TestReviewPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'testReviewRoute',
  )

export type TestReviewData = Awaited<ReturnType<ReturnType<typeof createTestReviewRoute>['loader']>>

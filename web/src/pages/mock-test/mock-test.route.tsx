import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { pageNotFound, RoutePage } from '../../app/routing'
import { MockTestPage } from './components/mock-test-page/mock-test-page'

export const createMockTestRoutes = (parent: AppRoute) => {
  const load = async (testId?: string, questionKey?: string) => {
    const resources = await wrap(parent.loader())
    const sittings = resources.learner()?.mockSittings ?? []

    const sitting = sittings.find((item) =>
      testId === undefined ? item.status === 'active' : item.id === testId,
    )

    if (sitting === undefined && testId === undefined) {
      return { ...resources, testId: undefined, selected: undefined }
    }

    if (sitting === undefined || sitting.status !== 'active') {
      throw pageNotFound()
    }
    const key = questionKey ?? sitting.answers[sitting.currentQuestion]?.questionKey
    const selected = key === undefined ? undefined : resources.questions.getQuestion(key)

    if (
      selected === undefined ||
      !sitting.answers.some((answer) => answer.questionKey === selected.key)
    ) {
      throw pageNotFound()
    }

    return { ...resources, testId: sitting.id, selected }
  }

  const question = parent.reatomRoute(
    {
      path: 'mock-test/:testId/:questionKey',
      loader: async ({ testId, questionKey }) => await wrap(load(testId, questionKey)),
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={MockTestPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'mockQuestionRoute',
  )

  const entry = parent.reatomRoute(
    {
      path: 'mock-test/:testId?',
      params: (params) => ({ testId: String(params.testId ?? '') || undefined }),
      loader: async ({ testId }) => {
        const isEntry = entry.exact()
        const data = await wrap(load(testId))

        if (isEntry && data.selected !== undefined && data.testId !== undefined) {
          question.go({ testId: data.testId, questionKey: data.selected.key }, true)
        }

        return data
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={MockTestPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'mockEntryRoute',
  )

  return { entry, question }
}

export type MockTestData = Awaited<
  ReturnType<ReturnType<typeof createMockTestRoutes>['question']['loader']>
>

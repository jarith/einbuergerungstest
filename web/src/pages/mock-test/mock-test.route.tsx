import type { ReactElement } from 'react'
import { atom, wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { pageNotFound, RoutePage } from '../../app/routing'
import { createQuestionMotion } from '../../modules/question-session'
import { MockTestPage } from './components/mock-test-page/mock-test-page'
import { createMockPageModel } from './mock-test.model'

export const createMockTestRoutes = (parent: AppRoute) => {
  const motion = createQuestionMotion()
  const picker = atom(false, 'mockRoute.picker')

  const load = async (testId?: string, questionKey?: string) => {
    const resources = await wrap(parent.loader())

    picker.set(false)

    const sittings = resources.learner()?.mockSittings ?? []

    const sitting = sittings.find((item) =>
      testId === undefined ? item.status === 'active' : item.id === testId,
    )

    if (sitting === undefined && testId === undefined) {
      return {
        ...resources,
        model: createMockPageModel(
          resources,
          undefined,
          undefined,
          (id, target) => question.go({ testId: id, questionKey: target }),
          motion,
          picker,
        ),
      }
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

    await wrap(resources.mock.navigate(selected.key))

    return {
      ...resources,
      model: createMockPageModel(
        resources,
        sitting.id,
        selected.key,
        (id, target) => question.go({ testId: id, questionKey: target }),
        motion,
        picker,
      ),
    }
  }

  const question = parent.reatomRoute(
    {
      path: 'mock-test/:testId/:questionKey',
      loader: async ({ testId, questionKey }) => await wrap(load(testId, questionKey)),
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={MockTestPage}
          keepPreviousData
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

        const current = data.model()

        if (isEntry && current.loaded !== undefined && current.sitting !== null) {
          question.go({ testId: current.sitting.id, questionKey: current.loaded.key }, true)
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

import { abortVar, wrap } from '@reatom/core'

import { createLearnerState } from '../modules/learner-state'
import { createMockTest } from '../modules/mock-test'
import { fetchQuestionBank } from '../modules/question-bank'
import { createLocalization } from './i18n/localization.model'

export const loadAppResources = async () => {
  const subscription = abortVar.subscribe()

  try {
    const questions = await wrap(fetchQuestionBank(subscription.controller.signal))
    const learner = createLearnerState(questions.bank)

    await wrap(learner.bootstrap())

    const localization = await wrap(createLocalization(learner))

    return { questions, learner, localization, mock: createMockTest(questions.bank, learner) }
  } finally {
    subscription.unsubscribe()
  }
}

export type AppResources = Awaited<ReturnType<typeof loadAppResources>>

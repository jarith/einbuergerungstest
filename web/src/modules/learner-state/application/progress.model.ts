import { computed } from '@reatom/core'

import type { QuestionBank } from '../../question-bank/domain'
import type { LearnerSnapshot } from '../domain/learner-state'
import { getQuestionAttempts } from '../domain/learner-state'
import { getMockSummaries, getMockTotals } from '../domain/mock-progress'
import {
  getGroupProgress,
  getQuestionProgressByKey,
  getQuestionTotals,
} from '../domain/question-progress'

export const createProgressModel = (bank: QuestionBank, snapshot: () => LearnerSnapshot) => {
  const attempts = computed(() => getQuestionAttempts(snapshot()), 'learnerState.progress.attempts')

  const questions = computed(
    () => getQuestionProgressByKey(bank, attempts()),
    'learnerState.progress.questions',
  )

  const totals = computed(
    () => getQuestionTotals([...questions().values()]),
    'learnerState.progress.totals',
  )

  const groups = computed(() => getGroupProgress(bank, questions()), 'learnerState.progress.groups')

  const mocks = computed(
    () => getMockSummaries(bank, snapshot().mockSittings),
    'learnerState.progress.mocks',
  )

  const mockTotals = computed(() => getMockTotals(mocks()), 'learnerState.progress.mockTotals')

  return computed(
    () => ({
      questions: questions(),
      totals: totals(),
      groups: groups(),
      mocks: mocks(),
      mockTotals: mockTotals(),
    }),
    'learnerState.progress',
  ).extend(() => ({ attempts, questions, totals, groups, mocks, mockTotals }))
}

import type { QuestionBank } from '../../question-bank/domain/question-bank'
import type { MockSitting } from './learner-state'
import { isCorrectAnswer } from '../../question-bank/domain/question-answer'
import { getQuestionKey } from '../../question-bank/domain/question-bank'

export type MockSummary = Readonly<{
  id: string
  startedAt: number
  endedAt: number | null
  total: number
  answered: number
}> &
  (
    | Readonly<{ status: 'completed'; score: number; result: 'passed' | 'failed' }>
    | Readonly<{ status: 'active' | 'unfinished'; score: null; result: null }>
  )

export type MockTotals = Readonly<{
  completed: number
  passed: number
  failed: number
  unfinished: number
  active: number
}>

export const getMockSummaries = (
  bank: QuestionBank,
  sittings: readonly MockSitting[],
): readonly MockSummary[] => {
  const questions = new Map(bank.questions.map((question) => [getQuestionKey(question), question]))

  return sittings
    .toSorted((left, right) => left.startedAt - right.startedAt)
    .map((sitting): MockSummary => {
      const summary = {
        id: sitting.id,
        startedAt: sitting.startedAt,
        endedAt: sitting.status === 'active' ? null : sitting.endedAt,
        total: sitting.answers.length,
        answered: sitting.answers.filter((answer) => answer.selectedOption !== null).length,
      }

      if (sitting.status !== 'completed') {
        return { ...summary, status: sitting.status, score: null, result: null }
      }

      const score = sitting.answers.reduce((total, answer) => {
        const question = questions.get(answer.questionKey)

        if (question === undefined) {
          throw new Error(
            `Cannot grade mock ${sitting.id}: question ${answer.questionKey} is missing.`,
          )
        }

        return total + Number(isCorrectAnswer(question, answer.selectedOption))
      }, 0)

      return { ...summary, status: 'completed', score, result: score >= 17 ? 'passed' : 'failed' }
    })
}

export const getMockTotals = (summaries: readonly MockSummary[]): MockTotals => ({
  completed: summaries.filter((sitting) => sitting.status === 'completed').length,
  passed: summaries.filter((sitting) => sitting.result === 'passed').length,
  failed: summaries.filter((sitting) => sitting.result === 'failed').length,
  unfinished: summaries.filter((sitting) => sitting.status === 'unfinished').length,
  active: summaries.filter((sitting) => sitting.status === 'active').length,
})

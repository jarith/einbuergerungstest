import type { MockSitting } from '../../learner-state/domain/learner-state'
import type { QuestionBank, QuestionKey } from '../../question-bank/domain/question-bank'
import { getQuestionKey } from '../../question-bank/domain/question-bank'

const sample = (keys: readonly QuestionKey[], count: number, random: () => number) => {
  const remaining = [...keys]

  return Array.from({ length: count }, () => {
    const value = random()

    if (value < 0 || value >= 1 || !Number.isFinite(value)) {
      throw new Error('Paper sampling requires a random value from zero up to one.')
    }
    const [key] = remaining.splice(Math.floor(value * remaining.length), 1)

    if (key === undefined) {
      throw new Error('The question bank does not contain enough questions for a paper.')
    }

    return key
  })
}

export const createMockPaper = (bank: QuestionBank, random: () => number): readonly QuestionKey[] =>
  (['general', 'berlin'] as const).flatMap((section) =>
    sample(
      bank.questions.flatMap((question) =>
        question.section === section ? [getQuestionKey(question)] : [],
      ),
      section === 'general' ? 30 : 3,
      random,
    ),
  )

export const getRemainingSeconds = (sitting: MockSitting, now: number): number =>
  Math.max(0, Math.ceil((sitting.deadline - now) / 1000))

export const finalizeMockSitting = (
  sitting: MockSitting,
  status: 'completed' | 'unfinished',
  endedAt: number,
): MockSitting =>
  sitting.status === 'active'
    ? {
        ...sitting,
        status: endedAt >= sitting.deadline ? 'completed' : status,
        endedAt: Math.max(endedAt, sitting.startedAt),
      }
    : sitting

export const getMockFinishReason = (sitting: MockSitting) => {
  if (sitting.status !== 'completed') {
    return null
  }

  return sitting.endedAt >= sitting.deadline ? 'timeout' : 'submitted'
}

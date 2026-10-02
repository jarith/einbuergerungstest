import type { Question, QuestionBank, QuestionKey } from '../../question-bank/domain'
import type { QuestionAttempt } from './learner-state'
import { isCorrectAnswer, getQuestionKey } from '../../question-bank/domain'

export type LearningStatus = 'not-started' | 'needs-review' | 'learning' | 'learned'

export type GradedQuestionAttempt = QuestionAttempt & Readonly<{ isCorrect: boolean }>

export type QuestionProgress = Readonly<{
  questionKey: QuestionKey
  groupId: string
  status: LearningStatus
  correctStreak: number
  attempts: readonly GradedQuestionAttempt[]
  attemptCount: number
  lastAttempt: GradedQuestionAttempt | null
}>

export type QuestionTotals = Readonly<{
  total: number
  contributing: number
  percentage: number
  attemptCount: number
  statuses: Readonly<Record<LearningStatus, number>>
}>

const getLearningStatus = (attemptCount: number, correctStreak: number): LearningStatus => {
  if (attemptCount === 0) {
    return 'not-started'
  }

  if (correctStreak === 0) {
    return 'needs-review'
  }

  return correctStreak === 1 ? 'learning' : 'learned'
}

const getQuestionProgress = (
  question: Question,
  attempts: readonly QuestionAttempt[],
): QuestionProgress => {
  const history = attempts
    .toSorted((left, right) => left.answeredAt - right.answeredAt)
    .map((attempt) => ({
      ...attempt,
      isCorrect: isCorrectAnswer(question, attempt.selectedOption),
    }))

  const correctStreak = history.reduce((streak, attempt) => (attempt.isCorrect ? streak + 1 : 0), 0)

  return {
    questionKey: getQuestionKey(question),
    groupId: question.group_id,
    status: getLearningStatus(history.length, correctStreak),
    correctStreak,
    attempts: history,
    attemptCount: history.length,
    lastAttempt: history.at(-1) ?? null,
  }
}

export const getQuestionProgressByKey = (
  bank: QuestionBank,
  attempts: readonly QuestionAttempt[],
): ReadonlyMap<QuestionKey, QuestionProgress> => {
  const histories = new Map<QuestionKey, QuestionAttempt[]>()

  attempts.forEach((attempt) => {
    const history = histories.get(attempt.questionKey) ?? []

    history.push(attempt)

    histories.set(attempt.questionKey, history)
  })

  return new Map(
    bank.questions.map((question) => {
      const key = getQuestionKey(question)

      return [key, getQuestionProgress(question, histories.get(key) ?? [])]
    }),
  )
}

export const getQuestionTotals = (questions: readonly QuestionProgress[]): QuestionTotals => {
  const statuses: Record<LearningStatus, number> = {
    'not-started': 0,
    'needs-review': 0,
    learning: 0,
    learned: 0,
  }

  questions.forEach((question) => {
    statuses[question.status] += 1
  })

  const contributing = statuses.learning + statuses.learned

  return {
    total: questions.length,
    contributing,
    percentage: questions.length === 0 ? 0 : Math.round((contributing / questions.length) * 100),
    attemptCount: questions.reduce((total, question) => total + question.attemptCount, 0),
    statuses,
  }
}

export const getGroupProgress = (
  bank: QuestionBank,
  questions: ReadonlyMap<QuestionKey, QuestionProgress>,
): ReadonlyMap<string, QuestionTotals> => {
  const progress = [...questions.values()]

  return new Map(
    bank.groups.map((group) => [
      group.id,
      getQuestionTotals(progress.filter((question) => question.groupId === group.id)),
    ]),
  )
}

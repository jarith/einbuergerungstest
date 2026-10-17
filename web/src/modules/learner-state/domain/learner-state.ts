import type { OptionLabel, QuestionKey } from '../../question-bank/domain'

export type Preferences = Readonly<{
  language: 'en' | 'de' | 'ru'
  studyTranslation: boolean
  appearance: 'light' | 'dark'
  plannedTestDate: string | null
}>

export type StudyPosition = Readonly<{
  questionKey: QuestionKey
  status: 'in-progress' | 'completed'
}>

export type StudyPositions = Readonly<{
  all: StudyPosition | null
  groups: Readonly<Partial<Record<string, StudyPosition>>>
}>

export type StudyAttempt = Readonly<{
  id: string
  questionKey: QuestionKey
  selectedOption: OptionLabel
  answeredAt: number
}>

export type MockAnswer = Readonly<{
  questionKey: QuestionKey
  selectedOption: OptionLabel | null
}>

type MockPaper = Readonly<{
  id: string
  startedAt: number
  deadline: number
  currentQuestion: number
  answers: readonly MockAnswer[]
}>

// endedAt orders terminal history; finishReason records the observed deadline decision.
export type MockSitting = MockPaper &
  (
    | Readonly<{ status: 'active' }>
    | Readonly<{ status: 'completed'; endedAt: number; finishReason: 'submitted' | 'timeout' }>
    | Readonly<{ status: 'unfinished'; endedAt: number }>
  )

export type LearnerSnapshot = Readonly<{
  version: 3
  preferences: Preferences
  positions: StudyPositions
  studyAttempts: readonly StudyAttempt[]
  mockSittings: readonly MockSitting[]
}>

export const createLearnerSnapshot = (): LearnerSnapshot => ({
  version: 3,
  preferences: {
    language: 'en',
    studyTranslation: false,
    appearance: 'light',
    plannedTestDate: null,
  },
  positions: { all: null, groups: {} },
  studyAttempts: [],
  mockSittings: [],
})

export const getLocalDate = (now: Date): string =>
  `${now.getFullYear().toString().padStart(4, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`

export const normalizeLearnerLaunch = (snapshot: LearnerSnapshot, now: Date): LearnerSnapshot => ({
  ...snapshot,
  preferences: {
    ...snapshot.preferences,
    plannedTestDate:
      snapshot.preferences.plannedTestDate !== null &&
      snapshot.preferences.plannedTestDate < getLocalDate(now)
        ? null
        : snapshot.preferences.plannedTestDate,
  },
  mockSittings: snapshot.mockSittings.map((sitting) =>
    sitting.status === 'active'
      ? { ...sitting, status: 'unfinished', endedAt: Math.max(now.getTime(), sitting.startedAt) }
      : sitting,
  ),
})

export type QuestionAttempt = Readonly<{
  id: string
  questionKey: QuestionKey
  selectedOption: OptionLabel
  answeredAt: number
  source: 'study' | 'mock'
}>

export const getQuestionAttempts = (snapshot: LearnerSnapshot): readonly QuestionAttempt[] => {
  const study = snapshot.studyAttempts.map((attempt): QuestionAttempt => ({
    ...attempt,
    source: 'study',
  }))

  const mocks = snapshot.mockSittings.flatMap((sitting) =>
    sitting.status === 'completed'
      ? sitting.answers.flatMap((answer): QuestionAttempt[] =>
          answer.selectedOption === null
            ? []
            : [
                {
                  id: `${sitting.id}/${answer.questionKey}`,
                  questionKey: answer.questionKey,
                  selectedOption: answer.selectedOption,
                  answeredAt: sitting.endedAt,
                  source: 'mock',
                },
              ],
        )
      : [],
  )

  return [...study, ...mocks].toSorted((left, right) => left.answeredAt - right.answeredAt)
}

// Keep answer ordering deterministic even within one clock tick or after a clock adjustment.
export const getNextAttemptTime = (snapshot: LearnerSnapshot, now: number): number => {
  const lastStudy = snapshot.studyAttempts.reduce(
    (latest, attempt) => Math.max(latest, attempt.answeredAt),
    -1,
  )

  const lastMock = snapshot.mockSittings.reduce(
    (latest, sitting) =>
      sitting.status === 'completed' ? Math.max(latest, sitting.endedAt) : latest,
    -1,
  )

  return Math.max(now, lastStudy + 1, lastMock + 1)
}

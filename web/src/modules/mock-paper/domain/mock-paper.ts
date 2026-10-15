import type { Question, QuestionKey } from '../../question-bank/domain'

type PaperQuestion = Pick<Question, 'id' | 'group_id'>

// Approved group allocations for 15/7/8 and 15/8/7 general-topic compositions.
// These implement the app's practice policy, not a verified current BAMF blueprint.
const topicQuotas = {
  democracy: [
    ['fundamental-rights', [2, 2]],
    ['state-structure', [6, 6]],
    ['elections-civic-participation', [4, 4]],
    ['rule-of-law-courts', [2, 2]],
    ['social-security', [1, 1]],
  ],
  history: [
    ['history-until-war-end', [1, 1]],
    ['postwar-history', [3, 4]],
    ['reunification', [1, 1]],
    ['europe-eu', [1, 1]],
    ['jewish-life-antisemitism', [1, 1]],
  ],
  society: [
    ['symbols-holidays-culture', [2, 1]],
    ['education-family-everyday-life', [5, 5]],
    ['migration', [1, 1]],
  ],
} as const

const drawRandom = (random: () => number) => {
  const value = random()

  if (value < 0 || value >= 1 || !Number.isFinite(value)) {
    throw new Error('Paper sampling requires a random value from zero up to one.')
  }

  return value
}

const sample = (keys: readonly QuestionKey[], count: number, random: () => number) => {
  const remaining = [...keys]

  return Array.from({ length: count }, () => {
    const index = Math.floor(drawRandom(random) * remaining.length)
    const [key] = remaining.splice(index, 1)

    if (key === undefined) {
      throw new Error('The question pool does not contain enough questions for a paper.')
    }

    return key
  })
}

const sampleGroup = (
  questions: readonly PaperQuestion[],
  group: string,
  count: number,
  random: () => number,
) => {
  const keys = questions.flatMap((question) => (question.group_id === group ? [question.id] : []))

  if (keys.length < count) {
    throw new Error(
      `Cannot form a mock paper: group "${group}" requires ${count} questions, but has ${keys.length}.`,
    )
  }

  return sample(keys, count, random)
}

/** Select a fresh paper from the validated bank, independently of learner history. */
export const createMockPaper = (
  questions: readonly PaperQuestion[],
  random: () => number,
): readonly QuestionKey[] => {
  const composition = drawRandom(random) < 0.5 ? 0 : 1

  const general = Object.values(topicQuotas).flatMap((groups) =>
    groups.flatMap(([group, counts]) => sampleGroup(questions, group, counts[composition], random)),
  )

  return [
    ...sample(general, general.length, random),
    ...sampleGroup(questions, 'berlin', 3, random),
  ]
}

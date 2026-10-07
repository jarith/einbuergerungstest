import { expect, test } from 'vitest'

import { createMockPaper } from '..'
import bank from '../../../../public/questionbank-berlin.json' with { type: 'json' }

// Independent acceptance examples from the approved allocation table.
const compositionA = {
  'constitution-rights': 3,
  'federalism-state-symbols': 2,
  'government-institutions': 2,
  'elections-participation': 5,
  'justice-legal-system': 2,
  'economy-social-security': 1,
  'jewish-life-nazi-history': 2,
  'postwar-ddr-reunification': 3,
  'europe-eu': 2,
  'family-education': 4,
  'everyday-administration': 1,
  'equality-religion-migration': 3,
  berlin: 3,
}

const compositionB = {
  ...compositionA,
  'postwar-ddr-reunification': 4,
  'equality-religion-migration': 2,
}

const questions = Object.freeze(
  bank.questions.map((question) => Object.freeze({ id: question.id, group_id: question.group_id })),
)

const findQuestion = (id: string) => {
  const question = bank.questions.find((candidate) => candidate.id === id)

  if (question === undefined) {
    throw new Error(`Paper contains unknown question "${id}".`)
  }

  return question
}

test.each([
  { value: 0, expected: compositionA },
  { value: 0.5 - Number.EPSILON, expected: compositionA },
  { value: 0.5, expected: compositionB },
  { value: 1 - Number.EPSILON, expected: compositionB },
])('random value $value produces the approved group quotas', ({ value, expected }) => {
  const paper = createMockPaper(questions, () => value)
  const selected = paper.map(findQuestion)

  const counts = Object.fromEntries(
    bank.groups.map((group) => [
      group.id,
      selected.filter((question) => question.group_id === group.id).length,
    ]),
  )

  expect(counts).toEqual(expected)
  expect(paper).toHaveLength(33)
  expect(new Set(paper).size).toBe(33)
  expect(selected.slice(0, 30).every((question) => question.section === 'general')).toBe(true)
  expect(selected.slice(30).every((question) => question.section === 'berlin')).toBe(true)
})

test.each([
  { value: 0, expected: compositionA },
  { value: 1 - Number.EPSILON, expected: compositionB },
])(
  'random value $value can select the edges of every group without replacement',
  ({ value, expected }) => {
    const paper = createMockPaper(questions, () => value)

    for (const [group, count] of Object.entries(expected)) {
      const candidates = questions.filter((question) => question.group_id === group)
      const edge = value === 0 ? candidates.slice(0, count) : candidates.slice(-count)
      const selected = paper.filter((id) => findQuestion(id).group_id === group)

      expect(new Set(selected)).toEqual(new Set(edge.map((question) => question.id)))
    }
  },
)

test.each([0.25, 0.75])(
  'general questions are interleaved across groups with random value %s',
  (value) => {
    const paper = createMockPaper(questions, () => value)
    const groups = paper.slice(0, 30).map((id) => findQuestion(id).group_id)
    const runs = groups.filter((group, index) => group !== groups[index - 1])

    // A concatenation of the twelve general groups would have only twelve runs.
    expect(runs.length).toBeGreaterThan(12)
  },
)

test('Berlin questions can appear in a different order from the bank', () => {
  const paper = createMockPaper(questions, () => 1 - Number.EPSILON)
  const berlin = questions.filter((question) => question.group_id === 'berlin')

  expect(paper.slice(30)).toEqual(
    berlin
      .slice(-3)
      .toReversed()
      .map((question) => question.id),
  )
})

test('generation leaves its input and earlier papers unchanged and allows repeats between tests', () => {
  const original = structuredClone(questions)
  const first = createMockPaper(questions, () => 0.25)
  const savedPaper = [...first]
  const second = createMockPaper(questions, () => 0.75)
  const repeated = createMockPaper(questions, () => 0.25)

  expect(questions).toEqual(original)
  expect(first).toEqual(savedPaper)
  expect(second).not.toEqual(first)
  expect(repeated).toEqual(first)
  expect(repeated).not.toBe(first)
})

test.each(
  [
    { value: 0, quotas: compositionA },
    { value: 0.5, quotas: compositionB },
  ].flatMap(({ value, quotas }) =>
    Object.entries(quotas).map(([group, count]) => ({ value, group, count })),
  ),
)('rejects a shortage in $group for composition draw $value', ({ value, group, count }) => {
  const shortened = [
    ...questions.filter((question) => question.group_id !== group),
    ...questions.filter((question) => question.group_id === group).slice(0, count - 1),
  ]

  expect(() => createMockPaper(shortened, () => value)).toThrow(
    `group "${group}" requires ${count} questions, but has ${count - 1}`,
  )
})

test.each([-0.01, 1, 1.01, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
  'rejects invalid random value %s',
  (value) => {
    expect(() => createMockPaper(questions, () => value)).toThrow(
      'Paper sampling requires a random value from zero up to one.',
    )
  },
)

test('validates later random draws as well as the composition draw', () => {
  const draws = [0, Number.NaN]

  expect(() => createMockPaper(questions, () => draws.shift() ?? Number.NaN)).toThrow(
    'Paper sampling requires a random value from zero up to one.',
  )
})

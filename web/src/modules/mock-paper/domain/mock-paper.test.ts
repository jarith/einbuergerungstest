import { expect, test } from 'vitest'

import { createMockPaper } from '..'
import bank from '../../../../public/questionbank-berlin.json' with { type: 'json' }

// Independent acceptance examples from the approved allocation table.
const compositionA = {
  'fundamental-rights': 2,
  'state-structure': 6,
  'elections-civic-participation': 4,
  'rule-of-law-courts': 2,
  'social-security': 1,
  'history-until-war-end': 1,
  'postwar-history': 3,
  reunification: 1,
  'europe-eu': 1,
  'jewish-life-antisemitism': 1,
  'symbols-holidays-culture': 2,
  'education-family-everyday-life': 5,
  migration: 1,
  berlin: 3,
}

const compositionB = {
  ...compositionA,
  'postwar-history': 4,
  'symbols-holidays-culture': 1,
}

const expectedPaperSize = 33

const expectedGeneralCount = 30

const makeQuestions = () =>
  structuredClone(
    bank.questions.map((question) => ({ id: question.id, group_id: question.group_id })),
  )

const findQuestion = (id: string) => {
  const question = bank.questions.find((candidate) => candidate.id === id)

  if (question === undefined) {
    throw new Error(`Paper contains unknown question "${id}".`)
  }

  return question
}

// Historical characterization: the lower half selects A and the upper half selects B.
// The approved policy requires equal probability, not this particular interval mapping.
test.each([
  { boundary: 'at the lower bound', value: 0, expected: compositionA },
  { boundary: 'just below the midpoint', value: 0.5 - Number.EPSILON, expected: compositionA },
  { boundary: 'at the midpoint', value: 0.5, expected: compositionB },
  { boundary: 'just below the upper bound', value: 1 - Number.EPSILON, expected: compositionB },
])(
  'characterizes approved group quotas $boundary of the random interval',
  ({ value, expected }) => {
    const questions = makeQuestions()

    const paper = createMockPaper(questions, () => value)
    const selected = paper.map(findQuestion)

    const counts = Object.fromEntries(
      bank.groups.map((group) => [
        group.id,
        selected.filter((question) => question.group_id === group.id).length,
      ]),
    )

    expect(counts).toEqual(expected)
    expect(paper).toHaveLength(expectedPaperSize)
    expect(new Set(paper).size).toBe(expectedPaperSize)
    expect(
      selected.slice(0, expectedGeneralCount).every((question) => question.section === 'general'),
    ).toBe(true)
    expect(
      selected.slice(expectedGeneralCount).every((question) => question.section === 'berlin'),
    ).toBe(true)
  },
)

test.each(Object.keys(compositionA))(
  'random draws can change the selected questions in %s without replacement',
  (group) => {
    const questions = makeQuestions()
    const firstDraw = () => 0
    const otherDraws = [0]
    const otherDraw = () => otherDraws.shift() ?? 1 - Number.EPSILON

    const first = createMockPaper(questions, firstDraw).filter(
      (id) => findQuestion(id).group_id === group,
    )

    const other = createMockPaper(questions, otherDraw).filter(
      (id) => findQuestion(id).group_id === group,
    )

    expect(new Set(first)).not.toEqual(new Set(other))
    expect(new Set(first).size).toBe(first.length)
    expect(new Set(other).size).toBe(other.length)
  },
)

test.each([
  {
    section: 'general',
    start: 0,
    end: expectedGeneralCount,
    orderKey: (id: string) => findQuestion(id).group_id,
  },
  {
    section: 'Berlin',
    start: expectedGeneralCount,
    end: expectedPaperSize,
    orderKey: (id: string) => id,
  },
])('randomizes the order of a fixed $section selection', ({ start, end, orderKey }) => {
  // Exactly the approved composition-A quotas leave no choice of membership.
  // Changing the random stream can therefore change only presentation order.
  const questions = Object.entries(compositionA).flatMap(([group, count]) =>
    makeQuestions()
      .filter((question) => question.group_id === group)
      .slice(0, count),
  )

  const firstDraw = () => 0
  const otherDraws = [0]
  const otherDraw = () => otherDraws.shift() ?? 1 - Number.EPSILON

  const first = createMockPaper(questions, firstDraw).slice(start, end)
  const other = createMockPaper(questions, otherDraw).slice(start, end)

  expect(new Set(other)).toEqual(new Set(first))
  expect(other.map(orderKey)).not.toEqual(first.map(orderKey))
})

test('generation leaves its source questions unchanged', () => {
  const questions = makeQuestions()
  const expectedQuestions = structuredClone(questions)

  createMockPaper(questions, () => 0.25)

  createMockPaper(questions, () => 0.75)

  createMockPaper(questions, () => 0.25)

  expect(questions).toEqual(expectedQuestions)
})

test('later generation preserves earlier papers including repeated selections', () => {
  const questions = makeQuestions()
  const earlierPaper = createMockPaper(questions, () => 0.25)
  const expectedEarlierPaper = [...earlierPaper]
  const repeatedPaper = createMockPaper(questions, () => 0.25)

  createMockPaper(questions, () => 0.75)

  expect(earlierPaper).toEqual(expectedEarlierPaper)
  expect(repeatedPaper).toEqual(expectedEarlierPaper)
})

test('different composition draws produce different papers', () => {
  const questions = makeQuestions()
  const earlierPaper = createMockPaper(questions, () => 0.25)

  const result = createMockPaper(questions, () => 0.75)

  expect(result).not.toEqual(earlierPaper)
})

test('generation allows an earlier paper to recur after another composition', () => {
  const questions = makeQuestions()
  const expectedPaper = [...createMockPaper(questions, () => 0.25)]

  createMockPaper(questions, () => 0.75)

  const result = createMockPaper(questions, () => 0.25)

  expect(result).toEqual(expectedPaper)
})

// Historical characterization: shortage diagnostics name the group and both counts.
// The approved policy requires rejection but does not prescribe the message text.
test.each(
  [
    { composition: 'A', value: 0, quotas: compositionA },
    { composition: 'B', value: 0.5, quotas: compositionB },
  ].flatMap(({ composition, value, quotas }) =>
    Object.entries(quotas).map(([group, count]) => ({ composition, value, group, count })),
  ),
)(
  'characterizes the shortage diagnostic in $group for composition $composition',
  ({ value, group, count }) => {
    const questions = makeQuestions()
    const available = count - 1
    const expectedError = `group "${group}" requires ${count} questions, but has ${available}`

    const shortened = [
      ...questions.filter((question) => question.group_id !== group),
      ...questions.filter((question) => question.group_id === group).slice(0, available),
    ]

    expect(() => createMockPaper(shortened, () => value)).toThrow(expectedError)
  },
)

test.each(
  [
    { composition: 'A', value: 0, quotas: compositionA },
    { composition: 'B', value: 0.5, quotas: compositionB },
  ].flatMap(({ composition, value, quotas }) =>
    Object.entries(quotas).flatMap(([group, count]) => [
      { composition, value, group, count, available: count, boundary: 'exactly on' },
      { composition, value, group, count, available: count + 1, boundary: 'just above' },
    ]),
  ),
)(
  'accepts a pool $boundary the $group quota for composition $composition',
  ({ value, group, count, available }) => {
    const questions = makeQuestions()

    const pool = [
      ...questions.filter((question) => question.group_id !== group),
      ...questions.filter((question) => question.group_id === group).slice(0, available),
    ]

    const result = createMockPaper(pool, () => value)
    const selectedGroup = result.filter((id) => findQuestion(id).group_id === group)

    expect(result).toHaveLength(expectedPaperSize)
    expect(selectedGroup).toHaveLength(count)
    expect(new Set(result).size).toBe(expectedPaperSize)
  },
)

// Historical characterization: every draw must be finite and in the half-open unit
// interval. Neither these invalid-input boundaries nor their diagnostic are approved policy.
test.each([
  { boundary: 'below the lower bound', value: -0.01 },
  { boundary: 'at the excluded upper bound', value: 1 },
  { boundary: 'above the upper bound', value: 1.01 },
  { boundary: 'not a number', value: Number.NaN },
  { boundary: 'positive infinity', value: Number.POSITIVE_INFINITY },
  { boundary: 'negative infinity', value: Number.NEGATIVE_INFINITY },
])('characterizes random-draw rejection for a value $boundary', ({ value }) => {
  const questions = makeQuestions()
  const expectedError = 'Paper sampling requires a random value from zero up to one.'

  expect(() => createMockPaper(questions, () => value)).toThrow(expectedError)
})

test('characterizes rejection of a nonnumeric draw after composition selection', () => {
  const questions = makeQuestions()
  const draws = [0, Number.NaN]
  const expectedError = 'Paper sampling requires a random value from zero up to one.'

  expect(() => createMockPaper(questions, () => draws.shift() ?? Number.NaN)).toThrow(expectedError)
})

import { expect, test } from 'vitest'

import type { LearnerSnapshot } from './learner-state'
import sourceBank from '../../../../public/questionbank-berlin.json' with { type: 'json' }
import { parseQuestionBank } from '../../question-bank/domain/question-bank'
import { createLearnerSnapshot } from './learner-state'
import { migrateStudyGroups } from './study-group-migration'

const makeSnapshot = (): LearnerSnapshot => ({
  ...createLearnerSnapshot(),
  positions: {
    all: { questionKey: 'wm7f3', status: 'in-progress' },
    groups: {
      berlin: { questionKey: 'n71rg', status: 'completed' },
      'europe-eu': { questionKey: '34ee5', status: 'in-progress' },
      'fundamental-rights': { questionKey: 'uz0sv', status: 'in-progress' },
    },
  },
  studyAttempts: [{ id: 'old-answer', questionKey: 'wm7f3', selectedOption: 'A', answeredAt: 1 }],
})

// Keep test names flat: the installed Stryker adapter uses space-joined names,
// while Vitest 5 separates describe suites when filtering individual tests.
test.each([
  'constitution-rights',
  'federalism-state-symbols',
  'government-institutions',
  'elections-participation',
  'justice-legal-system',
  'economy-social-security',
  'jewish-life-nazi-history',
  'postwar-ddr-reunification',
  'family-education',
  'everyday-administration',
  'equality-religion-migration',
])('retires the %s bookmark without changing saved learner facts', (group) => {
  const expected = makeSnapshot()

  const input: LearnerSnapshot = {
    ...structuredClone(expected),
    positions: {
      ...expected.positions,
      groups: {
        ...expected.positions.groups,
        [group]: { questionKey: 'tg3ei', status: 'completed' },
      },
    },
  }

  const original = structuredClone(input)
  const bank = parseQuestionBank(sourceBank)

  const result = migrateStudyGroups(input, bank)

  expect(result).toEqual(expected)
  expect(input).toEqual(original)
})

test('repeated launches preserve current group bookmarks and history', () => {
  const input = makeSnapshot()
  const bank = parseQuestionBank(sourceBank)

  const result = migrateStudyGroups(migrateStudyGroups(input, bank), bank)

  expect(result).toEqual(input)
})

test('does not hide an unknown question in a retired bookmark', () => {
  const input: LearnerSnapshot = {
    ...makeSnapshot(),
    positions: {
      all: null,
      groups: { 'constitution-rights': { questionKey: 'zzzzz', status: 'in-progress' } },
    },
  }

  const bank = parseQuestionBank(sourceBank)

  expect(() => migrateStudyGroups(input, bank)).toThrow('Unknown question zzzzz')
})

test('leaves unrecognized groups for reference validation to reject', () => {
  const input: LearnerSnapshot = {
    ...makeSnapshot(),
    positions: {
      all: null,
      groups: { unknown: { questionKey: 'tg3ei', status: 'in-progress' } },
    },
  }

  const bank = parseQuestionBank(sourceBank)

  const result = migrateStudyGroups(input, bank)

  expect(result.positions).toEqual(input.positions)
})

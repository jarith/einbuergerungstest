import { expect, test } from 'vitest'

import { isQuestionTranslationAvailable } from './question-answer'

// Flat names allow Stryker's Vitest adapter to select these tests.
// The UI language adds study/review translations; exam content stays German.
test.each([
  { mode: 'study', language: 'ru', expected: true },
  { mode: 'completed-review', language: 'ru', expected: true },
  { mode: 'live-mock', language: 'ru', expected: false },
  { mode: 'unfinished-review', language: 'ru', expected: false },
  { mode: 'study', language: 'en', expected: true },
  { mode: 'completed-review', language: 'en', expected: true },
  { mode: 'study', language: 'de', expected: false },
  { mode: 'completed-review', language: 'de', expected: false },
] as const)('$language in $mode: translation available is $expected', (scenario) => {
  const { mode, language, expected } = scenario

  const result = isQuestionTranslationAvailable(mode, language)

  expect(result).toBe(expected)
})

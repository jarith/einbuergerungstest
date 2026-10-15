import { DesignSystemProvider } from '@einbuergerungstest/design-system'
import { createInstance } from 'i18next'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import de from '../../../../app/i18n/de.json'
import en from '../../../../app/i18n/en.json'
import { fetchQuestionBank } from '../../infrastructure/question-bank-resource'
import { QuestionContent } from './question-content'

import '@einbuergerungstest/design-system/styles.css'

const cases = [
  { mode: 'study', language: 'en', enabled: false, translated: false, available: true },
  { mode: 'study', language: 'en', enabled: true, translated: true, available: true },
  { mode: 'study', language: 'de', enabled: true, translated: false, available: false },
  { mode: 'live-mock', language: 'en', enabled: true, translated: false, available: false },
  { mode: 'completed-review', language: 'en', enabled: true, translated: true, available: true },
  { mode: 'completed-review', language: 'de', enabled: true, translated: false, available: false },
] as const

test.each(
  cases.flatMap((scenario) => ['A', 'B', 'C', 'D'].map((label) => ({ ...scenario, label }))),
)('$mode: $language, translation preference $enabled, choice $label', async (scenario) => {
  const question = (await fetchQuestionBank()).bank.questions[0]

  if (question === undefined) {
    throw new Error('Question 1 is required by the content fixture.')
  }
  const i18n = createInstance()

  await i18n.init({
    lng: scenario.language,
    resources: { en: { translation: en }, de: { translation: de } },
    initAsync: false,
  })

  const interaction =
    scenario.mode === 'study'
      ? {
          mode: scenario.mode,
          hasJustLearned: false,
          shouldAnnounceFeedback: true,
          onSelect: () => undefined,
        }
      : scenario.mode === 'live-mock'
        ? { mode: scenario.mode, onSelect: () => undefined }
        : { mode: scenario.mode }

  const screen = await render(
    <DesignSystemProvider>
      <QuestionContent
        loaded={{ question, key: question.id, image: undefined }}
        interaction={interaction}
        selectedOption={scenario.mode === 'live-mock' ? question.correct_option : null}
        language={scenario.language}
        translationEnabled={scenario.enabled}
        onTranslationChange={() => undefined}
        t={i18n.getFixedT(scenario.language)}
      />
    </DesignSystemProvider>,
  )

  await expect
    .element(screen.getByRole('heading', { name: question.question_de, exact: true }))
    .toBeVisible()

  await expect
    .poll(
      () =>
        screen
          .getByText(question.question_en, { exact: true })
          .query()
          ?.checkVisibility({ checkVisibilityCSS: true }) ?? false,
    )
    .toBe(scenario.translated)

  const option = question.answer_options.find((candidate) => candidate.label === scenario.label)

  if (option === undefined) {
    throw new Error(`Choice ${scenario.label} is required by the content fixture.`)
  }
  const answer = screen.getByRole('radio', { name: new RegExp(`^${option.label}\\b`) })

  await expect.element(answer.getByText(option.text_de, { exact: true })).toBeVisible()

  await expect
    .poll(
      () =>
        answer
          .getByText(option.text_en, { exact: true })
          .query()
          ?.checkVisibility({ checkVisibilityCSS: true }) ?? false,
    )
    .toBe(scenario.translated)

  await expect
    .poll(() => screen.getByRole('note').query() !== null)
    .toBe(scenario.mode === 'completed-review')

  const translation = screen.getByRole('button', { name: i18n.t('settings.studyTranslation') })

  await expect.poll(() => translation.query() !== null).toBe(scenario.available)

  await expect
    .poll(() => translation.query()?.getAttribute('aria-pressed'))
    .toBe(scenario.available ? String(scenario.enabled) : undefined)
})

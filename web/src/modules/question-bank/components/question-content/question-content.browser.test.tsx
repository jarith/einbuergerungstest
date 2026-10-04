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

for (const scenario of cases) {
  test(`${scenario.mode}: ${scenario.language}, translation preference ${scenario.enabled}`, async () => {
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
      .poll(() => screen.getByText(question.question_en, { exact: true }).query() !== null)
      .toBe(scenario.translated)

    for (const option of question.answer_options) {
      const answer = screen.getByRole('radio', { name: new RegExp(`^${option.label}\\b`) })

      await expect.element(answer.getByText(option.text_de, { exact: true })).toBeVisible()

      await expect
        .poll(() => answer.getByText(option.text_en, { exact: true }).query() !== null)
        .toBe(scenario.translated)
    }

    await expect
      .poll(() => screen.getByRole('note').query() !== null)
      .toBe(scenario.mode === 'completed-review')

    const translation = screen.getByRole('switch', { name: i18n.t('settings.studyTranslation') })

    await expect.poll(() => translation.query() !== null).toBe(scenario.available)
  })
}

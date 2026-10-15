import { DesignSystemProvider } from '@einbuergerungstest/design-system'
import { createInstance } from 'i18next'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import type { QuestionMode } from '../../domain/question-answer'
import ru from '../../../../app/i18n/ru.json'
import { fetchQuestionBank } from '../../infrastructure/question-bank-resource'
import { QuestionContent } from './question-content'

import '@einbuergerungstest/design-system/styles.css'

const renderRussianQuestion = async (mode: QuestionMode, enabled: boolean) => {
  const question = (await fetchQuestionBank()).bank.questions[0]

  if (question === undefined) {
    throw new Error('Question 1 is required by the content fixture.')
  }
  const i18n = createInstance()

  await i18n.init({ lng: 'ru', resources: { ru: { translation: ru } }, initAsync: false })

  const screen = await render(
    <DesignSystemProvider>
      <QuestionContent
        loaded={{ question, key: question.id, image: undefined }}
        interaction={{
          mode,
          hasJustLearned: false,
          shouldAnnounceFeedback: false,
          onSelect: () => undefined,
        }}
        selectedOption={null}
        language="ru"
        translationEnabled={enabled}
        onTranslationChange={() => undefined}
        t={i18n.getFixedT('ru')}
      />
    </DesignSystemProvider>,
  )

  return { screen, question }
}

test.each(['study', 'completed-review'] as const)(
  '%s shows Russian question and every choice alongside German',
  async (mode) => {
    const { screen, question } = await renderRussianQuestion(mode, true)

    await expect.element(screen.getByRole('heading', { name: question.question_de })).toBeVisible()

    await expect.element(screen.getByText(question.question_ru, { exact: true })).toBeVisible()

    await expect
      .element(screen.getByText('здесь действует свобода вероисповедания.', { exact: true }))
      .toBeVisible()

    await expect.element(screen.getByText('люди платят налоги.', { exact: true })).toBeVisible()

    await expect
      .element(screen.getByText('люди имеют право голоса.', { exact: true }))
      .toBeVisible()

    await expect
      .element(screen.getByText('здесь действует свобода выражения мнений.', { exact: true }))
      .toBeVisible()

    await expect
      .element(screen.getByText('hier Meinungsfreiheit gilt.', { exact: true }).first())
      .toBeVisible()

    await expect
      .element(screen.getByRole('button', { name: 'Показать русский перевод' }))
      .toHaveAttribute('aria-pressed', 'true')

    await expect
      .element(screen.getByText(question.question_ru, { exact: true }))
      .toHaveAttribute('lang', 'ru')

    await expect
      .element(screen.getByText(question.question_en, { exact: true }))
      .not.toBeInTheDocument()
  },
)

test('study keeps Russian text hidden when translation is off', async () => {
  const { screen, question } = await renderRussianQuestion('study', false)

  await expect.element(screen.getByRole('heading', { name: question.question_de })).toBeVisible()

  await expect.element(screen.getByText(question.question_ru, { exact: true })).not.toBeVisible()

  await expect.element(screen.getByText('люди платят налоги.', { exact: true })).not.toBeVisible()

  await expect
    .element(screen.getByRole('button', { name: 'Показать русский перевод' }))
    .toHaveAttribute('aria-pressed', 'false')
})

test.each(['live-mock', 'unfinished-review'] as const)(
  '%s keeps German content without a Russian translation control',
  async (mode) => {
    const { screen, question } = await renderRussianQuestion(mode, true)

    await expect.element(screen.getByRole('heading', { name: question.question_de })).toBeVisible()

    await expect
      .element(screen.getByText(question.question_ru, { exact: true }))
      .not.toBeInTheDocument()

    await expect
      .element(screen.getByRole('button', { name: 'Показать русский перевод' }))
      .not.toBeInTheDocument()
  },
)

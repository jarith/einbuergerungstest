import { expect, test } from '@playwright/test'

import { progressFixture, seedProfile } from '../journeys/fixtures'
import {
  openNavigation,
  questionStatusLabel,
  sourceQuestion,
  studyAnswer,
} from '../support/browser'
import { chooseLanguage, expectViewportFit } from './helpers'

for (const language of ['English', 'Deutsch'] as const) {
  test(`${language} status filters fit the progress screen at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 })

    await page.goto('/dashboard')

    await chooseLanguage(page, language)

    await page.getByRole('link', { name: /^(Study all questions|Alle Fragen lernen)$/ }).click()

    await studyAnswer(page, 'D').click()

    await openNavigation(page, '/progress')

    await page.getByText(new RegExp(`^${questionStatusLabel('learned')} ·`)).click()

    await expect(
      page.getByText(/No questions have this status yet|Noch keine Fragen mit diesem Status/),
    ).toBeVisible()

    await expectViewportFit(page)

    await page.getByText(new RegExp(`^${questionStatusLabel('learning')} ·`)).click()

    await expect(
      page.getByRole('radio', { name: new RegExp(`^${questionStatusLabel('learning')} ·`) }),
    ).toBeChecked()

    await expectViewportFit(page)
  })
}

test('progress reveals ten more matching questions and keeps bank-wide totals', async ({
  page,
}) => {
  const saved = progressFixture()

  await seedProfile(
    page,
    JSON.stringify({
      ...saved,
      studyAttempts: Array.from({ length: 11 }, (_, index) => ({
        id: `learning-${index}`,
        questionKey: sourceQuestion(index + 1).id,
        selectedOption: sourceQuestion(index + 1).correct_option,
        answeredAt: Date.now() - 1000 + index,
      })),
    }),
  )

  await openNavigation(page, '/progress')

  const questions = page.getByRole('region', { name: 'Question status', exact: true })
  const rows = questions.getByRole('listitem')
  const mocks = page.getByRole('region', { name: 'Mock tests', exact: true })

  await expect(rows).toHaveCount(10)
  await expect(questions.getByText('Showing 10 of 310 questions', { exact: true })).toBeVisible()
  await expect(mocks.getByRole('listitem')).toHaveCount(1)

  await questions.getByRole('button', { name: 'Show next 10 questions' }).click()

  await expect(rows).toHaveCount(20)
  await expect(questions.getByText('All · 310', { exact: true })).toBeVisible()

  await questions.getByText('Learning · 11', { exact: true }).click()

  await expect(rows).toHaveCount(10)
  await expect(questions.getByText('Showing 10 of 11 questions', { exact: true })).toBeVisible()

  await questions.getByRole('button', { name: 'Show next question', exact: true }).click()

  await expect(rows).toHaveCount(11)
  await expect(questions.getByRole('button', { name: /Show next/ })).toHaveCount(0)
  await expect(questions.getByText('Not started · 299', { exact: true })).toBeVisible()
  await expect(mocks.getByRole('listitem')).toHaveCount(1)

  await questions.getByText('Not started · 299', { exact: true }).click()

  await expect(rows).toHaveCount(10)
  await expect(rows.first()).toContainText(`12 · ${sourceQuestion(12).question_de}`)

  await rows.first().getByRole('link').click()

  await page.getByRole('link', { name: 'Back to progress', exact: true }).click()

  await expect(page).toHaveURL(/\/progress$/)
  await expect(questions).toBeVisible()
})

test('the separate all-questions list route is removed', async ({ page }) => {
  await page.goto('/progress/questions')

  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible()
})

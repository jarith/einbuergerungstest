import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  expectHighlight,
  sourceQuestion,
  studyAnswer,
  openNavigation,
  questionRow,
} from './helpers'

const { When, Then } = createBdd()

When('I start studying', async ({ page }) => {
  await page.getByRole('link', { name: /^(Study all questions|Alle Fragen lernen)$/ }).click()
})

When('I resume studying', async ({ page }) => {
  await openNavigation(page, '/')

  await page.getByRole('link', { name: /^(Study all questions|Alle Fragen lernen)$/ }).click()
})

Then('study question {int} of 310 is shown', async ({ page }, number: number) => {
  await expect(page.getByText(new RegExp(`^${number}/310$`))).toBeVisible()
  await expect(page.locator('h2[lang=de]')).toHaveText(sourceQuestion(number).question_de)
})

When('I select study answer {string}', async ({ page }, label: string) => {
  await studyAnswer(page, label).click()
})

Then('study answer {string} is marked wrong', async ({ page }, label: string) => {
  const option = studyAnswer(page, label)

  await expect(option).toContainText(/Falsch|Incorrect|Wrong/)

  await expectHighlight(option, 'red')
})

Then('study answer {string} is marked correct', async ({ page }, label: string) => {
  const option = studyAnswer(page, label)

  await expect(option).toContainText(/Richtig|Correct/)

  await expectHighlight(option, 'green')
})

Then('I see immediate incorrect feedback', async ({ page }) => {
  await expect(page.locator('[aria-live=polite]')).toContainText(/Falsch|Incorrect|Wrong/)
})

Then('I see immediate correct feedback', async ({ page }) => {
  await expect(page.locator('[aria-live=polite]')).toContainText(/Richtig|Correct/)
})

When('I retry the study question', async ({ page }) => {
  await page.getByRole('button', { name: /^(Retry question|Erneut versuchen)$/ }).click()
})

When('I enable English translation', async ({ page }) => {
  await page.getByRole('switch', { name: 'Show English translation', exact: true }).click()

  await expect(
    page.getByRole('switch', { name: 'Show English translation', exact: true }),
  ).toBeChecked()
})

Then(
  'the original German text for study question {int} is visible without translation',
  async ({ page }, number: number) => {
    const question = sourceQuestion(number)

    await expect(page.getByText(question.question_de, { exact: true })).toBeVisible()
    await expect(page.getByText(question.question_en, { exact: true })).toHaveCount(0)

    for (const option of question.answer_options) {
      await expect(
        studyAnswer(page, option.label).getByText(option.text_de, { exact: true }),
      ).toBeVisible()
      await expect(
        studyAnswer(page, option.label).getByText(option.text_en, { exact: true }),
      ).toHaveCount(0)
    }
  },
)

Then('the translation control is absent', async ({ page }) => {
  await expect(page.getByRole('switch', { name: /translation|übersetzung/i })).toHaveCount(0)
})

Then(
  'German and English text for study question {int} and its options are visible',
  async ({ page }, number: number) => {
    const question = sourceQuestion(number)

    await expect(page.getByText(question.question_de, { exact: true })).toBeVisible()
    await expect(page.getByText(question.question_en, { exact: true })).toBeVisible()

    for (const option of question.answer_options) {
      await expect(
        studyAnswer(page, option.label).getByText(option.text_de, { exact: true }),
      ).toBeVisible()
      await expect(
        studyAnswer(page, option.label).getByText(option.text_en, { exact: true }),
      ).toBeVisible()
    }
  },
)

When('I go to the next study question', async ({ page }) => {
  await page.getByRole('button', { name: /^(Next|Weiter)$/ }).click()
})

When('I go to the previous study question', async ({ page }) => {
  await page.getByRole('button', { name: /^(Previous|Zurück)$/ }).click()
})

When('I open question {int} from progress', async ({ page }, number: number) => {
  const row = await questionRow(page, number)

  await row.click()

  await page.getByRole('link', { name: /^(Study this question|Diese Frage lernen)$/ }).click()
})

Then('the study question illustration is visible', async ({ page }) => {
  await expect(
    page.getByRole('img', { name: /Illustration for question|Abbildung zu Frage/ }),
  ).toBeVisible()
})

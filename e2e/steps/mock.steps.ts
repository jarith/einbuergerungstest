import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  mockAnswer,
  questionStatusLabel,
  sourceQuestionInText,
  sourceQuestionOnPage,
} from './helpers'

const { Given, When, Then } = createBdd()

const firstAnsweredQuestion = new WeakMap<Page, number>()

When('I start a mock test', async ({ page }) => {
  await page.getByRole('button', { name: /^(Start test|Test starten)$/ }).click()
})

Then('the live mock question and choices are in German', async ({ page }) => {
  const question = await sourceQuestionOnPage(page)

  await expect(page.getByText(question.question_en, { exact: true })).toHaveCount(0)

  for (const option of question.answer_options) {
    await expect(page.getByText(option.text_de, { exact: true })).toBeVisible()
    await expect(page.getByText(option.text_en, { exact: true })).toHaveCount(0)
  }
})

Then('the mock timer starts at 60 minutes', async ({ page }) => {
  await expect(page.getByRole('timer', { name: 'Verbleibende Zeit' })).toHaveText('60:00')
})

Then('the mock contains 30 general and 3 Berlin questions without repeats', async ({ page }) => {
  const seen = new Set<number>()
  const counts = { general: 0, berlin: 0 }

  // Each navigation must finish before the next question can be inspected.
  // oxlint-disable-next-line app/prefer-array-methods
  for (const index of Array.from({ length: 33 }, (_, offset) => offset)) {
    await expect(page.getByText(`Frage ${index + 1} von 33`, { exact: true })).toBeVisible()

    const question = await sourceQuestionOnPage(page)

    expect(seen.has(question.number)).toBe(false)

    seen.add(question.number)

    if (question.section === 'general') {
      counts.general += 1
      await expect(page.getByText('Allgemein', { exact: true })).toBeVisible()
    } else if (question.section === 'berlin') {
      counts.berlin += 1
      await expect(page.getByText('Berlin', { exact: true })).toBeVisible()
    } else {
      throw new Error(`Unknown question section: ${question.section}`)
    }

    if (index < 32) {
      await page.getByRole('button', { name: 'Weiter', exact: true }).click()
    }
  }

  expect(counts).toEqual({ general: 30, berlin: 3 })
  expect(seen.size).toBe(33)
})

Then('English translation is unavailable in the live mock', async ({ page }) => {
  const question = await sourceQuestionOnPage(page)

  await expect(
    page.getByRole('button', { name: /translation|übersetzung|Show English|Englisch anzeigen/i }),
  ).toHaveCount(0)
  await expect(page.getByText(question.question_en, { exact: true })).toHaveCount(0)
})

When('I select mock answer {string}', async ({ page }, label: string) => {
  await mockAnswer(page, label).check()
})

When('I change mock answer to {string}', async ({ page }, label: string) => {
  await mockAnswer(page, label).check()
})

Then('only mock answer {string} is selected', async ({ page }, selected: string) => {
  for (const label of ['A', 'B', 'C', 'D']) {
    if (label === selected) {
      await expect(mockAnswer(page, label)).toBeChecked()
    } else {
      await expect(mockAnswer(page, label)).not.toBeChecked()
    }
  }
})

Then('no answer feedback is shown', async ({ page }) => {
  await expect(page.getByRole('status', { name: 'Antwortfeedback' })).toHaveCount(0)
})

When('I go to the next mock question', async ({ page }) => {
  await page.getByRole('button', { name: 'Weiter', exact: true }).click()
})

When('I go to the previous mock question', async ({ page }) => {
  await page.getByRole('button', { name: 'Zurück', exact: true }).click()
})

When('I try to submit the mock test', async ({ page }) => {
  await page.getByRole('button', { name: 'Test abgeben' }).click()
})

Then('I am warned that 33 questions are unanswered', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Unbeantwortete Fragen' })).toContainText(
    '33 unbeantwortete Fragen',
  )
})

When('I cancel mock submission', async ({ page }) => {
  await page
    .getByRole('dialog', { name: 'Unbeantwortete Fragen' })
    .getByRole('button', { name: 'Weiter bearbeiten' })
    .click()
})

Then('the live mock remains open', async ({ page }) => {
  await expect(page.getByRole('timer', { name: 'Verbleibende Zeit' })).toBeVisible()
  await expect(page.getByText(/Frage \d+ von 33/)).toBeVisible()
})

When('I submit the mock test with unanswered questions', async ({ page }) => {
  await page.getByRole('button', { name: /^(Submit test|Test abgeben)$/ }).click()

  await page
    .getByRole('dialog', { name: /^(Unanswered questions|Unbeantwortete Fragen)$/ })
    .getByRole('button', { name: /^(Submit anyway|Trotzdem abgeben)$/ })
    .click()
})

Then(
  'the mock result is {int} of 33 and {string}',
  async ({ page }, score: number, result: string) => {
    const summary = page.getByRole('status', { name: 'Testergebnis' })

    await expect(summary).toContainText(new RegExp(`${score}\\s*(?:/|von)\\s*33`))
    await expect(summary).toContainText(result === 'passed' ? 'Bestanden' : 'Nicht bestanden')
  },
)

Then('the completed test review shows every question and correct answer', async ({ page }) => {
  const questions = page.getByRole('article', { name: /^Frage \d+$/ })

  await expect(questions).toHaveCount(33)

  for (const index of Array.from({ length: 33 }, (_, offset) => offset)) {
    await expect(questions.nth(index)).toContainText('Richtige Antwort')
  }
})

When('I enable English translation in the review', async ({ page }) => {
  await page
    .getByRole('button', { name: /^(Show translation|Show English|Englisch anzeigen)$/ })
    .click()
})

Then('German and English appear together in the review', async ({ page }) => {
  const firstReview = page.getByRole('article', { name: /^(Question|Frage) 1$/ })
  const visibleText = await firstReview.innerText()
  const question = sourceQuestionInText(visibleText)

  await expect(firstReview).toContainText(question.question_de)
  await expect(firstReview).toContainText(question.question_en)

  for (const option of question.answer_options) {
    await expect(firstReview).toContainText(option.text_de)
    await expect(firstReview).toContainText(option.text_en)
  }
})

When('I open the completed test from history', async ({ page }) => {
  await page
    .getByRole('button', { name: /Abgeschlossen/ })
    .first()
    .click()
})

When(
  'I answer {int} mock questions correctly and leave the rest blank',
  async ({ page }, correct: number) => {
    for (const index of Array.from({ length: correct }, (_, offset) => offset)) {
      const question = await sourceQuestionOnPage(page)

      await mockAnswer(page, question.correct_option).check()

      if (index < correct - 1) {
        await page.getByRole('button', { name: 'Weiter', exact: true }).click()
      }
    }
  },
)

When('I answer the first mock question correctly', async ({ page }) => {
  const question = await sourceQuestionOnPage(page)

  firstAnsweredQuestion.set(page, question.number)

  await mockAnswer(page, question.correct_option).check()
})

Then('that mock question has status {string}', async ({ page }, status: string) => {
  const number = firstAnsweredQuestion.get(page)

  if (number === undefined) {
    throw new Error('No mock question was recorded in this scenario.')
  }

  const label = questionStatusLabel(status)

  await expect(
    page.getByRole('button', { name: new RegExp(`Frage ${number}.*${label}`) }),
  ).toBeVisible()
})

Given('the browser clock is controlled', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T10:00:00Z') })
})

When('60 minutes pass', async ({ page }) => {
  await page.clock.fastForward(60 * 60 * 1_000)
})

When('I try to leave the mock test', async ({ page }) => {
  await page.getByRole('button', { name: 'Test verlassen' }).click()
})

Then('I see an exit confirmation', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Test verlassen' })).toBeVisible()
})

When('I stay in the mock test', async ({ page }) => {
  await page
    .getByRole('dialog', { name: 'Test verlassen' })
    .getByRole('button', { name: 'Im Test bleiben' })
    .click()
})

When('I leave the mock test after confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Test verlassen' }).click()

  await page
    .getByRole('dialog', { name: 'Test verlassen' })
    .getByRole('button', { name: 'Ohne Ergebnis verlassen' })
    .click()
})

Then('the unfinished test appears in history without a score', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Unvollständig.*Ohne Ergebnis/ })).toBeVisible()
})

When('I open the unfinished test from history', async ({ page }) => {
  await page.getByRole('button', { name: /Unvollständig.*Ohne Ergebnis/ }).click()
})

Then(
  'the unfinished test review shows mock answer {string} without a score',
  async ({ page }, label: string) => {
    await expect(page.getByRole('article', { name: 'Frage 1' })).toContainText(
      `Ihre Antwort: ${label}`,
    )
    await expect(page.getByRole('status', { name: 'Testergebnis' })).toHaveCount(0)
  },
)

When('I briefly background the app', async ({ page }) => {
  const otherTab = await page.context().newPage()

  await otherTab.goto('about:blank')

  await otherTab.bringToFront()

  await page.clock.fastForward(5 * 60 * 1_000)

  await otherTab.close()

  await page.bringToFront()
})

Then('the mock timer shows 55 minutes remaining', async ({ page }) => {
  await expect(page.getByRole('timer', { name: 'Verbleibende Zeit' })).toHaveText('55:00')
})

When('I relaunch the app', async ({ page }) => {
  await page.reload()
})

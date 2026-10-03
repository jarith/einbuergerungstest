import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  mockAnswer,
  questionStatusLabel,
  sourceQuestionOnPage,
  sourceQuestion,
  questionRow,
  openNavigation,
  expectHighlight,
  openBackup,
} from './helpers'

const { Given, When, Then } = createBdd()

const firstAnsweredQuestion = new WeakMap<Page, number>()

Given(
  'the mock sampler selects a question with language-neutral choices first',
  async ({ page }) => {
    // Question 20 includes a choice whose German and English names are identical.
    // The existing localization scenario continues to exercise random sampling.
    await page.evaluate(() => {
      Math.random = () => 19 / 300
    })
  },
)

Then('the mock question includes a language-neutral choice', async ({ page }) => {
  const question = await sourceQuestionOnPage(page)

  expect(question.answer_options.some((option) => option.text_de === option.text_en)).toBe(true)
})

Given('I import a study attempt dated tomorrow', async ({ page }) => {
  await openNavigation(page, '/settings')

  await openBackup(page)

  await page.locator('input[type=file]').setInputFiles({
    name: 'future-history.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        version: 3,
        preferences: {
          language: 'de',
          studyTranslation: false,
          appearance: 'light',
          plannedTestDate: null,
        },
        positions: { all: null, groups: {} },
        studyAttempts: [
          {
            id: 'future-study',
            questionKey: sourceQuestion(1).id,
            selectedOption: 'D',
            answeredAt: new Date('2026-01-02T10:00:00Z').getTime(),
          },
        ],
        mockSittings: [],
      }),
    ),
  })

  await page.getByRole('button', { name: 'Sicherung importieren', exact: true }).click()

  await page.getByRole('dialog').getByRole('button', { name: 'Sicherung importieren' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)

  await openNavigation(page, '/')
})

When('the browser clock moves backward one day', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2025-12-31T10:00:00Z'))
})

Then('the review reports manual submission', async ({ page }) => {
  await expect(page.getByText('Von dir abgegeben.', { exact: true })).toBeVisible()
  await expect(page.getByText(/^Die Zeit ist abgelaufen\./)).toHaveCount(0)
})

Then('the review reports deadline expiry', async ({ page }) => {
  await expect(page.getByText(/^Die Zeit ist abgelaufen\./)).toBeVisible()
  await expect(page.getByText('Von dir abgegeben.', { exact: true })).toHaveCount(0)
})

When('I start a mock test', async ({ page }) => {
  await page.getByRole('link', { name: /^(Start mock test|Probetest starten)$/ }).click()

  await page.getByRole('button', { name: /^(Start mock test|Probetest starten)$/ }).click()

  await expect(page.getByRole('timer')).toBeVisible()
})

Then('the live mock question and choices are in German', async ({ page }) => {
  const question = await sourceQuestionOnPage(page)
  const choices = page.getByRole('radiogroup', { name: question.question_de, exact: true })

  await expect(page.locator('h2[lang=de]')).toHaveText(question.question_de)
  await expect(choices.locator('[lang=en]')).toHaveCount(0)

  for (const option of question.answer_options) {
    await expect(mockAnswer(page, option.label).locator('[lang=de]')).toHaveText(option.text_de)
    await expect(mockAnswer(page, option.label).locator('[lang=de]')).toBeVisible()
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
    await expect(
      page.getByRole('heading', { level: 1, name: new RegExp(`Frage ${index + 1} von 33`) }),
    ).toBeVisible()

    const question = await sourceQuestionOnPage(page)

    expect(seen.has(question.order)).toBe(false)

    seen.add(question.order)

    if (question.section === 'general') {
      counts.general += 1
    } else if (question.section === 'berlin') {
      counts.berlin += 1
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
  await expect(page.getByRole('switch', { name: /translation|übersetzung/i })).toHaveCount(0)
  await expect(page.getByRole('main').locator('[lang=en]')).toHaveCount(0)
})

When('I select mock answer {string}', async ({ page }, label: string) => {
  await mockAnswer(page, label).click()

  await expect(mockAnswer(page, label)).toBeChecked()
})

When('I change mock answer to {string}', async ({ page }, label: string) => {
  await mockAnswer(page, label).click()

  await expect(mockAnswer(page, label)).toBeChecked()
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
  await expect(page.getByText(/^(Richtig|Falsch|Correct|Incorrect)$/)).toHaveCount(0)
  await expect(page.getByText(/^(Richtige Antwort|Correct answer):/)).toHaveCount(0)
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
  await expect(page.getByRole('dialog', { name: 'Diesen Test abgeben?' })).toContainText(
    '33 unbeantwortete Fragen',
  )
})

When('I cancel mock submission', async ({ page }) => {
  await page
    .getByRole('dialog', { name: 'Diesen Test abgeben?' })
    .getByRole('button', { name: 'Schließen', exact: true })
    .click()
})

Then('the live mock remains open', async ({ page }) => {
  await expect(page.getByRole('timer', { name: 'Verbleibende Zeit' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: /Frage \d+ von 33/ })).toBeVisible()
})

When('I submit the mock test with unanswered questions', async ({ page }) => {
  await page.getByRole('button', { name: /^(Submit test|Test abgeben)$/ }).click()

  await page
    .getByRole('dialog', { name: /^(Submit this test\?|Diesen Test abgeben\?)$/ })
    .getByRole('button', { name: /^(Submit test|Test abgeben)$/ })
    .click()
})

Then(
  'the mock result is {int} of 33 and {string}',
  async ({ page }, score: number, result: string) => {
    const summary = page.getByRole('main')

    await expect(page).toHaveURL(/\/progress\/tests\//)

    await expect(summary.getByRole('heading', { name: `${score} / 33`, exact: true })).toBeVisible()
    await expect(summary).toContainText(
      result === 'passed' ? 'Probetest bestanden' : 'Nicht bestanden',
    )
  },
)

Then('the completed test review shows every question and correct answer', async ({ page }) => {
  await page.getByRole('button', { name: /^(All 33 questions|Alle 33 Fragen)$/ }).click()

  const picker = page.getByRole('dialog')
  const entries = picker.getByRole('button', { name: /^(Question|Frage) \d+ (of|von) 33/ })

  await expect(entries).toHaveCount(33)

  await entries.first().click()

  const seen = new Set<number>()

  // Visit the full paper through review navigation and verify each correct answer.
  // oxlint-disable-next-line app/prefer-array-methods
  for (let index = 0; index < 33; index += 1) {
    await expect(
      page.getByText(new RegExp(`(?:Question|Frage) ${index + 1} (?:of|von) 33$`)),
    ).toBeVisible()

    const question = await sourceQuestionOnPage(page)

    expect(seen.has(question.order)).toBe(false)

    seen.add(question.order)

    const correct = mockAnswer(page, question.correct_option)

    await expect(correct).toContainText(/Richtig|Correct/)

    await expectHighlight(correct, 'green')

    if (index < 32) {
      await page.getByRole('button', { name: /^(Next|Weiter)$/ }).click()
    }
  }

  expect(seen.size).toBe(33)
})

When('I enable English translation in the review', async ({ page }) => {
  await page.getByRole('switch', { name: 'Show English translation', exact: true }).click()

  await expect(
    page.getByRole('switch', { name: 'Show English translation', exact: true }),
  ).toBeChecked()
})

Then('German and English appear together in the review', async ({ page }) => {
  const firstReview = page.getByRole('main')
  const question = await sourceQuestionOnPage(page)

  await expect(firstReview).toContainText(question.question_de)
  await expect(firstReview).toContainText(question.question_en)

  for (const option of question.answer_options) {
    await expect(firstReview).toContainText(option.text_de)
    await expect(firstReview).toContainText(option.text_en)
  }
})

When('I open the completed test from history', async ({ page }) => {
  await page
    .getByRole('link', { name: /(?:\d+ von 33 richtig|\d+ of 33 correct)/ })
    .first()
    .click()
})

When(
  'I answer {int} mock questions correctly and leave the rest blank',
  async ({ page }, correct: number) => {
    for (const index of Array.from({ length: correct }, (_, offset) => offset)) {
      await expect(
        page.getByRole('heading', { level: 1, name: new RegExp(`Frage ${index + 1} von 33$`) }),
      ).toBeVisible()

      const question = await sourceQuestionOnPage(page)

      await mockAnswer(page, question.correct_option).click()

      await expect(mockAnswer(page, question.correct_option)).toBeChecked()

      if (index < correct - 1) {
        await page.getByRole('button', { name: 'Weiter', exact: true }).click()
      }
    }
  },
)

When('I answer the first mock question correctly', async ({ page }) => {
  const question = await sourceQuestionOnPage(page)

  firstAnsweredQuestion.set(page, question.order)

  await mockAnswer(page, question.correct_option).click()

  await expect(mockAnswer(page, question.correct_option)).toBeChecked()
})

Then('that mock question has status {string}', async ({ page }, status: string) => {
  const number = firstAnsweredQuestion.get(page)

  if (number === undefined) {
    throw new Error('No mock question was recorded in this scenario.')
  }

  const row = await questionRow(page, number)

  await expect(row).toContainText(new RegExp(questionStatusLabel(status)))

  await openNavigation(page, '/progress')
})

Given('the browser clock is controlled', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T10:00:00Z') })
})

When('60 minutes pass', async ({ page }) => {
  await page.clock.fastForward(60 * 60 * 1_000)
})

When('I try to leave the mock test', async ({ page }) => {
  await page.getByRole('link', { name: 'Test verlassen', exact: true }).click()
})

Then('I see an exit confirmation', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Diesen Test verlassen?' })).toBeVisible()
})

When('I stay in the mock test', async ({ page }) => {
  await page
    .getByRole('dialog', { name: 'Diesen Test verlassen?' })
    .getByRole('button', { name: 'Im Test bleiben', exact: true })
    .click()
})

When('I leave the mock test after confirmation', async ({ page }) => {
  await page.getByRole('link', { name: 'Test verlassen', exact: true }).click()

  await page
    .getByRole('dialog', { name: 'Diesen Test verlassen?' })
    .getByRole('button', { name: 'Test verlassen', exact: true })
    .click()
})

Then('the unfinished test appears in history without a score', async ({ page }) => {
  await expect(
    page.getByRole('link', { name: /(?:Ohne Ergebnis.*Nicht abgeschlossen|No score.*Unfinished)/ }),
  ).toBeVisible()
})

When('I open the unfinished test from history', async ({ page }) => {
  await page
    .getByRole('link', { name: /(?:Ohne Ergebnis.*Nicht abgeschlossen|No score.*Unfinished)/ })
    .click()
})

Then(
  'the unfinished test review shows mock answer {string} without a score',
  async ({ page }, label: string) => {
    await expect(page.getByRole('main')).toContainText(`Deine Auswahl: ${label}`)
    await expect(mockAnswer(page, label)).toBeChecked()
    await expect(page.getByText('Keine Punktzahl', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: /\d+ \/ 33/ })).toHaveCount(0)
    await expect(page.getByText(/^(Richtige Antwort|Correct answer):/)).toHaveCount(0)
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

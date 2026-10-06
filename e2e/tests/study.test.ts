import { expect, test } from '@playwright/test'

import { openNavigation, sourceQuestion, studyAnswer } from '../support/browser'
import { chooseLanguage, expectViewportFit, waitForAppReady } from './helpers'

for (const { width, height } of [
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
]) {
  test(`study controls fit ${width} × ${height} with touch-sized answers`, async ({ page }) => {
    await page.setViewportSize({ width, height })

    await page.goto('/dashboard')

    await chooseLanguage(page, 'Deutsch')

    await page.getByRole('link', { name: 'Alle Fragen lernen', exact: true }).click()

    await expect(studyAnswer(page, 'A')).toBeVisible()

    await expectViewportFit(page)

    for (const label of ['A', 'B', 'C', 'D']) {
      const bounds = await studyAnswer(page, label).boundingBox()

      if (bounds === null) {
        throw new Error(`Answer ${label} has no visible touch target`)
      }

      expect(bounds.width).toBeGreaterThanOrEqual(44)
      expect(bounds.height).toBeGreaterThanOrEqual(44)
    }
  })
}

test(
  'new study feedback preserves keyboard focus and is not reannounced on return',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto(`/study/${sourceQuestion(1).id}`)

    await waitForAppReady(page)

    await studyAnswer(page, 'D').click()

    await openNavigation(page, '/dashboard')

    await page.getByRole('link', { name: 'Study all questions', exact: true }).click()

    const answer = studyAnswer(page, 'D')

    // The live-region attributes are the browser contract under test, not BDD content selectors.
    const announcement = page
      .locator('[aria-live]')
      .filter({ hasText: 'Correct — now marked Learned' })

    await answer.focus()

    await answer.press('Space')

    await expect(answer).toContainText('Correct')
    await expect(page.getByRole('note').filter({ hasText: /Correct/ })).toHaveCount(0)
    await expect(announcement).toHaveAttribute('aria-live', 'polite')
    await expect(announcement).toHaveAttribute('aria-atomic', 'true')
    await expect(answer).toBeFocused()

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(
      page.getByRole('heading', { name: sourceQuestion(2).question_de, exact: true }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Previous', exact: true }).click()

    await expect(answer).toContainText('Correct')
    await expect(announcement).toHaveAttribute('aria-live', 'off')
    await expect(answer).not.toBeFocused()
  },
)

for (const { language, width } of [
  { language: 'English', width: 390 },
  { language: 'Deutsch', width: 1440 },
] as const) {
  test(`${language} study help opens by keyboard and retains focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })

    await page.goto('/dashboard')

    await chooseLanguage(page, language)

    await page.getByRole('link', { name: /^(Study all questions|Alle Fragen lernen)$/ }).click()

    await studyAnswer(page, 'A').click()

    const help = page
      .locator('details')
      .filter({ hasText: /How study works|So funktioniert Lernen/ })

    const trigger = help.locator('summary')

    const instructions = help.getByText(
      /Earlier attempts and saved positions remain|Frühere Versuche und gespeicherte Positionen bleiben erhalten/,
    )

    await expect(instructions).toBeHidden()

    await trigger.focus()

    await trigger.press('Enter')

    await expect(instructions).toBeVisible()
    await expect(trigger).toBeFocused()

    await expectViewportFit(page)

    await trigger.press('Space')

    await expect(instructions).toBeHidden()
    await expect(trigger).toBeFocused()

    await expectViewportFit(page)

    await expect(
      page.getByRole('heading', { name: sourceQuestion(1).question_de, exact: true }),
    ).toBeVisible()
    await expect(studyAnswer(page, 'A')).toBeChecked()
    await expect(studyAnswer(page, 'A')).toBeDisabled()
    await expect(studyAnswer(page, 'A')).toContainText(/Incorrect|Falsch/)
    await expect(page.getByRole('note').filter({ hasText: /Incorrect|Falsch/ })).toHaveCount(0)
  })
}

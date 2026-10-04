import { expect, test } from '@playwright/test'

import { openNavigation, questionStatusLabel, studyAnswer } from '../support/browser'
import { chooseLanguage, expectViewportFit } from './helpers'

for (const language of ['English', 'Deutsch'] as const) {
  test(`${language} status filters fit both progress screens at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 })

    await page.goto('/')

    await chooseLanguage(page, language)

    await page.getByRole('link', { name: /^(Study all questions|Alle Fragen lernen)$/ }).click()

    await studyAnswer(page, 'D').click()

    await openNavigation(page, '/progress')

    await page.getByText(new RegExp(`^${questionStatusLabel('learned')} ·`)).click()

    await expect(
      page.getByText(/No questions have this status yet|Noch keine Fragen mit diesem Status/),
    ).toBeVisible()

    await expectViewportFit(page)

    await page
      .getByRole('link', { name: /^(Browse all 310 questions|Alle 310 Fragen ansehen)/ })
      .click()

    await page.getByText(new RegExp(`^${questionStatusLabel('learning')} ·`)).click()

    await expect(
      page.getByRole('radio', { name: new RegExp(`^${questionStatusLabel('learning')} ·`) }),
    ).toBeChecked()

    await expectViewportFit(page)
  })
}

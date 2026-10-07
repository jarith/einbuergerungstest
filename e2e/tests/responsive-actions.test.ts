import { expect, test } from '@playwright/test'

import questionBank from '../../web/public/questionbank-berlin.json' with { type: 'json' }
import { downloadBackup, openNavigation } from '../support/browser'
import {
  chooseLanguage,
  expectReadable,
  expectReachableAboveNavigation,
  expectViewportFit,
  startMock,
} from './helpers'

for (const width of [320, 390]) {
  test(`translated study content wraps and its next action is reachable at ${width}px`, async ({
    page,
  }) => {
    const question = questionBank.questions.toSorted(
      (left, right) =>
        right.question_de.length +
        right.question_en.length -
        left.question_de.length -
        left.question_en.length,
    )[0]

    if (question === undefined) {
      throw new Error('The question bank must contain study content.')
    }

    await page.setViewportSize({ width, height: 844 })

    await page.goto(`/study/${question.id}`)

    const translation = page.getByRole('button', { name: 'Show English translation', exact: true })

    await expect(translation).toHaveAttribute('aria-pressed', 'false')

    await translation.focus()

    await translation.press('Space')

    await expect(translation).toHaveAttribute('aria-pressed', 'true')
    await expect(translation).toBeFocused()

    await expect(page.getByText(question.question_en, { exact: true })).toBeVisible()

    await expectReadable(page.getByRole('heading', { name: question.question_de, exact: true }))

    await expectReadable(page.getByRole('radio'))

    await expectViewportFit(page)

    await expectReachableAboveNavigation(
      page,
      page.getByRole('button', { name: 'Next', exact: true }),
    )

    await page.reload()

    await expect(translation).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(question.question_en, { exact: true })).toBeVisible()

    await translation.press('Enter')

    await expect(translation).toHaveAttribute('aria-pressed', 'false')
    await expect(translation).toBeFocused()
    await expect(page.getByText(question.question_en, { exact: true })).toHaveCount(0)
  })

  test(`German mock and translated review actions remain reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })

    await page.goto('/dashboard')

    await chooseLanguage(page, 'Deutsch')

    await startMock(page)

    await expectReadable(page.getByRole('radio'))

    await expectViewportFit(page)

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

    await expectReachableAboveNavigation(
      page,
      page.getByRole('link', { name: 'Test verlassen', exact: true }),
    )

    await page.getByRole('button', { name: 'Test abgeben', exact: true }).click()

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Test abgeben', exact: true })
      .click()

    await expect(page).toHaveURL(/\/progress\/tests\//)

    const reviewUrl = page.url()

    await chooseLanguage(page, 'English')

    await page.goto(reviewUrl)

    await page.getByRole('button', { name: 'Show English translation', exact: true }).click()

    // Both language blocks must fit inside their choices, not merely inside the document.
    await expectReadable(page.getByRole('radio'))

    await expectViewportFit(page)

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

    const picker = page.getByRole('button', { name: 'All 33 questions', exact: true })

    await expectReachableAboveNavigation(page, picker)

    await picker.click()

    await expect(page.getByRole('dialog', { name: 'All 33 questions', exact: true })).toBeVisible()
  })

  test(`German backup comparison and import action fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })

    await page.goto('/dashboard')

    await chooseLanguage(page, 'Deutsch')

    await openNavigation(page, '/settings')

    const path = await downloadBackup(page)
    const fileChooser = page.waitForEvent('filechooser')

    await page.getByRole('button', { name: 'Backup-Datei', exact: true }).click()

    await (await fileChooser).setFiles(path)

    await expect(page.getByRole('heading', { name: 'Backup-Vorschau', exact: true })).toBeVisible()
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(8)

    await expectReadable(page.getByRole('table').getByRole('cell'))

    await expectReadable(page.getByRole('table').getByRole('rowheader'))

    await expectViewportFit(page)

    const importBackup = page.getByRole('button', { name: 'Sicherung importieren', exact: true })

    await expectReachableAboveNavigation(page, importBackup)

    await importBackup.click()

    await expect(page.getByRole('dialog', { name: /Lokale Daten ersetzen/ })).toBeVisible()
  })
}

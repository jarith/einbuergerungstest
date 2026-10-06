import { expect, test } from '@playwright/test'

import { sourceQuestion, studyAnswer } from '../support/browser'

for (const mode of ['browser', 'installed'] as const) {
  for (const width of [390, 820]) {
    test.describe(`${mode} navigation at ${width}px`, () => {
      const base = mode === 'installed' ? '/pwa' : ''
      const question = sourceQuestion(1)

      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 1180 })

        if (mode === 'installed') {
          await page.addInitScript(() =>
            Object.defineProperty(navigator, 'standalone', { value: true }),
          )
        }
      })

      test('Continue group renders the saved question within the app base', async ({ page }) => {
        // Establish a saved position without relying on the dashboard link under test.
        await page.goto(`${base}/study/groups/${question.group_id}`)

        await expect(studyAnswer(page, 'A')).toBeVisible()

        await page.getByRole('button', { name: 'Next', exact: true }).tap()

        await expect(page.locator('[data-question-heading]')).not.toHaveText(question.question_de)

        const savedUrl = page.url()
        const heading = await page.locator('[data-question-heading]').innerText()

        await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).tap()

        const resume = page.getByRole('link', { name: /^Continue group/ }).first()

        await resume.tap()

        await expect(studyAnswer(page, 'A')).toBeVisible()
        await expect(page).toHaveURL(savedUrl)
        await expect(page.locator('[data-question-heading]')).toHaveText(heading)

        await page
          .getByRole('main')
          .getByRole('link', { name: /Back to dashboard$/ })
          .tap()

        await expect(page).toHaveURL(`${base}/dashboard`)
        await expect(resume).toHaveAttribute('href', `${base}/study/groups/${question.group_id}`)
      })

      test('Progress opens question history and study within the app base', async ({ page }) => {
        await page.goto(`${base}/progress`)

        await page.getByRole('link').filter({ hasText: question.question_de }).tap()

        const study = page.getByRole('link', { name: 'Study this question', exact: true })
        const back = page.getByRole('link', { name: 'Back to progress', exact: true })

        await expect(study).toBeVisible()
        await expect(page).toHaveURL(`${base}/progress/questions/${question.id}`)
        await expect(study).toHaveAttribute('href', `${base}/study/${question.id}`)
        await expect(back).toHaveAttribute('href', `${base}/progress`)

        await study.tap()

        await expect(page).toHaveURL(`${base}/study/${question.id}`)
        await expect(
          page.getByRole('heading', { name: question.question_de, exact: true }),
        ).toBeVisible()
        await expect(studyAnswer(page, 'A')).toBeVisible()

        await page.goBack()

        await back.tap()

        await expect(page).toHaveURL(`${base}/progress`)
        await expect(page.getByRole('link').filter({ hasText: question.question_de })).toBeVisible()
      })
    })
  }
}

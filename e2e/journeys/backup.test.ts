import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'
import { openSettings, progressFixture, seedProfile } from './fixtures'

test(
  'backup replaces local history and settings with the downloaded copy',
  { tag: '@smoke' },
  async ({ page }) => {
    // E2E criterion: irreversible replacement; actual browser download and file selection.
    const saved = progressFixture()

    if (saved.preferences.plannedTestDate === null) {
      throw new Error('The backup fixture must include a planned date to restore.')
    }

    const expectedPlannedDate = saved.preferences.plannedTestDate.split('-').reverse().join('.')

    await seedProfile(page, JSON.stringify(saved))

    await openSettings(page)

    const pendingDownload = page.waitForEvent('download')

    await page.getByRole('button', { name: 'Download backup', exact: true }).click()

    const download = await pendingDownload
    const path = await download.path()

    if (!path) {
      throw new Error('Backup download did not produce a file.')
    }

    await seedProfile(
      page,
      JSON.stringify({
        ...saved,
        preferences: { ...saved.preferences, plannedTestDate: null },
        studyAttempts: saved.studyAttempts.map((attempt) => ({
          ...attempt,
          id: 'study-replaced-by-backup',
          questionKey: sourceQuestion(2).id,
          selectedOption: sourceQuestion(2).correct_option,
        })),
        mockSittings: saved.mockSittings.map((sitting) => ({
          ...sitting,
          id: 'mock-replaced-by-backup',
        })),
      }),
    )

    await openSettings(page)

    const pendingChooser = page.waitForEvent('filechooser')

    await page.getByLabel('Backup file', { exact: true }).click()

    await (await pendingChooser).setFiles(path)

    await expect(page.getByRole('heading', { name: 'Backup preview', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Import backup', exact: true }).click()

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Import backup', exact: true })
      .click()

    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.reload()

    await expect(page.getByLabel('Planned test date', { exact: true })).toHaveValue(
      expectedPlannedDate,
    )
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

    await expect(page.getByText('Needs review · 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Learning · 0', { exact: true })).toBeVisible()

    await page.getByRole('tab', { name: 'Mock tests', exact: true }).click()

    const history = page.getByRole('region', { name: 'Test history', exact: true })
    const review = history.getByRole('link')
    const expectedReviewPath = '/progress/tests/completed-before-backup'

    await expect(history).toContainText('1 completed')
    await expect(review).toHaveCount(1)
    await expect(review).toBeVisible()
    await expect(review).toHaveAttribute('href', expectedReviewPath)
  },
)

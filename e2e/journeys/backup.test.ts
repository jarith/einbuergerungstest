import { expect, test } from '@playwright/test'

import { openSettings, progressFixture, seedProfile } from './fixtures'

test(
  'backup replaces local history and settings with the downloaded copy',
  { tag: '@smoke' },
  async ({ page }) => {
    // E2E criterion: irreversible replacement; actual browser download and file selection.
    const saved = progressFixture()

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
        studyAttempts: [],
        mockSittings: [],
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

    await expect(page.getByLabel('Planned test date', { exact: true })).not.toHaveValue('')
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

    await expect(page.getByText('Needs review · 1', { exact: true })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Mock tests', exact: true })).toContainText(
      '1 completed',
    )
  },
)

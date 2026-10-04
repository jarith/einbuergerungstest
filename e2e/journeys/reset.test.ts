import { expect, test } from '@playwright/test'

import { expectEmptyHistory, openSettings, seedProfile } from './fixtures'

test('confirmed reset erases the saved learner history', async ({ page }) => {
  // E2E criterion: irreversible deletion of the learner's only local history.
  await seedProfile(page)

  await openSettings(page)

  await page.getByRole('button', { name: 'Reset local progress', exact: true }).click()

  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Reset local progress', exact: true })
    .click()

  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.reload()

  await expectEmptyHistory(page)
})

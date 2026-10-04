import { expect, test } from '@playwright/test'

import { mockAnswer } from '../support/browser'

test('a stale submission shows conflict recovery inside its confirmation dialog', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Start mock test', exact: true }).click()

  await page.getByRole('button', { name: 'Start mock test', exact: true }).click()

  await mockAnswer(page, 'A').click()

  const other = await page.context().newPage()

  await other.goto('/settings')

  await other
    .getByRole('radiogroup', { name: 'Appearance' })
    .getByText('Dark', { exact: true })
    .click()

  await expect(other.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked()

  await other.close()

  await page.getByRole('button', { name: 'Submit test', exact: true }).click()

  const dialog = page.getByRole('dialog')

  await dialog.getByRole('button', { name: 'Submit test', exact: true }).click()

  await expect(dialog.getByRole('alert')).toContainText('Your data changed in another app window.')
  await expect(dialog.getByRole('button', { name: 'Reload app' })).toBeVisible()
})

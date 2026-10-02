import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { mockAnswer, openNavigation } from './helpers'

const { When, Then } = createBdd()

When('another app window changes the saved preferences', async ({ page }) => {
  const other = await page.context().newPage()

  await other.goto('/settings')

  await other
    .getByRole('radiogroup', { name: 'Appearance' })
    .getByText('Dark', { exact: true })
    .click()

  await expect(other.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')

  await other.close()
})

When('I select a stale mock answer {string}', async ({ page }, label: string) => {
  await mockAnswer(page, label).click()
})

When('I submit the stale mock test', async ({ page }) => {
  await page.getByRole('button', { name: 'Submit test', exact: true }).click()

  await page.getByRole('dialog').getByRole('button', { name: 'Submit test', exact: true }).click()
})

Then('the submission dialog offers conflict recovery', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Your data changed in another app window.',
  )
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Reload app' })).toBeVisible()
})

Then('I see storage conflict guidance with a reload action', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('Your data changed in another app window.')
  await expect(page.getByRole('button', { name: 'Reload app' })).toBeVisible()
})

When('I reload using the conflict recovery action', async ({ page }) => {
  const dialog = page.getByRole('dialog')
  const recovery = (await dialog.count()) ? dialog : page.getByRole('main')

  await recovery.getByRole('button', { name: 'Reload app' }).click()

  await expect(page.getByRole('button', { name: 'Reload app' })).toHaveCount(0)
})

Then(
  'the unfinished review retains answer {string} without grading',
  async ({ page }, label: string) => {
    await expect(mockAnswer(page, label)).toBeChecked()
    await expect(page.getByText('No score', { exact: true })).toBeVisible()
    await expect(page.getByText(/^Correct answer:/)).toHaveCount(0)
  },
)

When('I try to change the stale review translation', async ({ page }) => {
  await page.getByRole('switch', { name: 'Show English translation', exact: true }).click()
})

Then('the newer appearance preference is preserved', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')
})

Then('the review translation remains disabled', async ({ page }) => {
  await expect(
    page.getByRole('switch', { name: 'Show English translation', exact: true }),
  ).not.toBeChecked()

  await openNavigation(page, '/progress')

  await expect(page.getByRole('region', { name: 'Mock tests' })).toContainText('1 completed')
})

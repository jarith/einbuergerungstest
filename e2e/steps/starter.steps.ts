import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

Given('I open the starter', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'Web app starter' })).toBeVisible()
})

When('I increment the counter', async ({ page }) => {
  await page.getByRole('button', { name: 'Increment', exact: true }).click()
})

When('I switch to the dark theme', async ({ page }) => {
  await page.getByRole('button', { name: 'Use dark theme' }).click()
})

Then('the count remains {int}', async ({ page }, count: number) => {
  await expect(page.getByRole('status', { name: 'Count' })).toHaveText(String(count))
})

Then('the application uses the dark theme', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')
})

When('I reset the counter', async ({ page }) => {
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
})

Then('the count is {int}', async ({ page }, count: number) => {
  await expect(page.getByRole('status', { name: 'Count' })).toHaveText(String(count))
})

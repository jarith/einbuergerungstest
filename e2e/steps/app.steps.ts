import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { openNavigation } from './helpers'

const { Given, When, Then } = createBdd()

Given('I open the app with a fresh learner profile', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 })
})

When('I open progress', async ({ page }) => {
  await openNavigation(page, '/progress')
})

When('I open settings', async ({ page }) => {
  await openNavigation(page, '/settings')
})

When('I open dashboard', async ({ page }) => {
  await openNavigation(page, '/')
})

When('I choose {word} as UI language', async ({ page }, language: string) => {
  if (language !== 'English' && language !== 'German') {
    throw new Error(`Unsupported UI language: ${language}`)
  }

  await openNavigation(page, '/settings')

  const label = language === 'German' ? 'Deutsch' : 'English'

  await page
    .getByRole('radiogroup', { name: /^(Interface language|Sprache der Benutzeroberfläche)$/ })
    .getByText(label, { exact: true })
    .click()

  await expect(page.getByRole('radio', { name: label, exact: true })).toBeChecked()

  await expect(page.locator('html')).toHaveAttribute('lang', language === 'German' ? 'de' : 'en')

  await openNavigation(page, '/')
})

Then('English interface controls are visible', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Study all questions', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start mock test', exact: true })).toBeVisible()
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }),
  ).toBeVisible()
})

Then('German interface controls are visible', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Alle Fragen lernen', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Probetest starten', exact: true })).toBeVisible()
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Daten', exact: true }),
  ).toBeVisible()
})

When('I reload the app', async ({ page }) => {
  await page.reload()
})

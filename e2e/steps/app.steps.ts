import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

Given('I open the app with a fresh learner profile', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 })
})

When('I open progress', async ({ page }) => {
  await page.getByRole('button', { name: /^(Progress|Fortschritt)$/ }).click()
})

When('I open settings', async ({ page }) => {
  await page.getByRole('button', { name: /^(Settings|Einstellungen)$/ }).click()
})

When('I open dashboard', async ({ page }) => {
  await page.getByRole('button', { name: /^(Dashboard|Startseite)$/ }).click()
})

When('I choose {word} as UI language', async ({ page }, language: string) => {
  if (language !== 'English' && language !== 'German') {
    throw new Error(`Unsupported UI language: ${language}`)
  }

  await page.getByRole('button', { name: /^(Settings|Einstellungen)$/ }).click()

  const optionName = language === 'German' ? /^(German|Deutsch)$/ : /^(English|Englisch)$/
  const radio = page.getByRole('radio', { name: optionName })

  if (await radio.count()) {
    await radio.check()
  } else {
    const selector = page.getByRole('combobox', { name: /^(UI language|App-Sprache)$/ })
    const nativeOption = selector.locator('option').filter({ hasText: optionName })

    if (await nativeOption.count()) {
      const label = (await nativeOption.textContent())?.trim()

      if (label === undefined || label === '') {
        throw new Error(`No visible option for ${language}`)
      }

      await selector.selectOption({ label })
    } else {
      await selector.click()

      await page.getByRole('option', { name: optionName }).click()
    }
  }

  await page.getByRole('button', { name: /^(Dashboard|Startseite)$/ }).click()
})

Then('English interface controls are visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /^(Study|Resume studying)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start test', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible()
})

Then('German interface controls are visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /^(Lernen|Lernen fortsetzen)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Test starten', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Einstellungen', exact: true })).toBeVisible()
})

When('I reload the app', async ({ page }) => {
  await page.reload()
})

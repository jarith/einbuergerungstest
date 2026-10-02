import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const testDateInput = (page: Page) => page.getByLabel(/^(Test date|Testdatum)$/)

const saveDateIfNeeded = async (page: Page) => {
  const save = page.getByRole('button', { name: /^(Save|Speichern)$/ })

  if (await save.isVisible()) {
    await save.click()
  } else {
    await testDateInput(page).press('Tab')
  }
}

const fillTestDate = async (page: Page, date: string) => {
  await testDateInput(page).fill(date)

  await saveDateIfNeeded(page)
}

Given('I open the app on local date {string}', async ({ page }, date: string) => {
  await page.clock.install({ time: new Date(`${date}T12:00:00Z`) })

  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible()
})

When('the local date becomes {string}', async ({ page }, date: string) => {
  await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`))
})

When('I set the test date to {string}', async ({ page }, date: string) => {
  await fillTestDate(page, date)
})

When('I try to set the test date to {string}', async ({ page }, date: string) => {
  await fillTestDate(page, date)
})

When('I clear the test date', async ({ page }) => {
  await page.getByRole('button', { name: /^(Clear test date|Testdatum löschen)$/ }).click()
})

Then('the test date is empty', async ({ page }) => {
  await expect(testDateInput(page)).toHaveValue('')
})

Then('the past test date is rejected with visible feedback', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText(/past|today|future|Vergangenheit|heute/i)
})

Then(
  'the dashboard shows {int} of 310 questions contributing to progress and {int} percent',
  async ({ page }, contributing: number, percent: number) => {
    const dashboard = page.getByRole('main')

    await expect(dashboard).toContainText(new RegExp(`\\b${contributing}\\s*/\\s*310\\b`))
    await expect(dashboard).toContainText(new RegExp(`\\b${percent}\\s*%`))
  },
)

Then('the dashboard shows {int} days until the test', async ({ page }, days: number) => {
  await expect(page.getByRole('main')).toContainText(
    new RegExp(`\\b${days}\\s+(?:days?|Tage?)\\b`, 'i'),
  )
})

Then('the dashboard says the test is today', async ({ page }) => {
  await expect(page.getByRole('main')).toContainText(
    /test.*today|today.*test|Test.*heute|heute.*Test/i,
  )
})

Then('the dashboard has no test date message', async ({ page }) => {
  await expect(page.getByRole('main')).not.toContainText(
    /\b\d+\s+(?:days?|Tage?)\b|test.*today|today.*test|Test.*heute|heute.*Test/i,
  )
})

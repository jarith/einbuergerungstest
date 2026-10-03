import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const testDateInput = (page: Page) =>
  page.getByLabel(/^(Planned test date|Geplanter Prüfungstermin)$/)

const fillTestDate = async (page: Page, date: string) => {
  await testDateInput(page).fill(date)

  await testDateInput(page).press('Enter')
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
  await page.getByRole('button', { name: /^(Clear|Löschen)$/ }).click()
})

Then('the test date is empty', async ({ page }) => {
  await expect(testDateInput(page)).toHaveValue('')
})

Then('the past test date is rejected with visible feedback', async ({ page }) => {
  await expect(
    page.getByText(
      /Choose today or a future test date|Wähle heute oder ein zukünftiges Prüfungsdatum/,
    ),
  ).toContainText(/past|today|future|Vergangenheit|heute/i)
})

Then(
  'the dashboard shows {int} of 310 questions contributing to progress and {int} percent',
  async ({ page }, contributing: number, percent: number) => {
    const dashboard = page.getByRole('main')

    await expect(dashboard).toContainText(new RegExp(`\\b${contributing}\\s*/\\s*310\\b`), {
      useInnerText: true,
    })
    await expect(dashboard).toContainText(new RegExp(`\\b${percent}\\s*%`), { useInnerText: true })
  },
)

Then('the dashboard shows {int} days until the test', async ({ page }, days: number) => {
  await expect(page.getByRole('main')).toContainText(
    new RegExp(`\\b${days}\\s+(?:days?|Tage?)\\b`, 'i'),
    { useInnerText: true },
  )
})

Then('the dashboard says the test is today', async ({ page }) => {
  await expect(page.getByRole('main')).toContainText(
    /test.*today|today.*test|Prüfung.*heute|heute.*Prüfung/i,
  )
})

Then('the dashboard has no test date message', async ({ page }) => {
  await expect(page.getByRole('main')).not.toContainText(
    /\b\d+\s+(?:days?|Tage?)\b|test.*today|today.*test|Prüfung.*heute|heute.*Prüfung/i,
  )
})

When('the app resumes at {string}', async ({ page }, instant: string) => {
  await page.clock.setSystemTime(new Date(instant))

  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'))

    document.dispatchEvent(new Event('visibilitychange'))
  })
})

When('1 minute passes on the dashboard', async ({ page }) => {
  await page.clock.fastForward(60_000)
})

Then('the test date remains {string}', async ({ page }, date: string) => {
  await expect(testDateInput(page)).toHaveValue(date.split('-').toReversed().join('.'))
})

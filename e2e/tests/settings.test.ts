import { expect, test } from '@playwright/test'

import { openNavigation } from '../support/browser'
import { chooseLanguage } from './helpers'

test('the planned date uses day-month-year display formatting', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-26T12:00:00Z') })

  await page.goto('/settings')

  const date = page.getByLabel('Planned test date', { exact: true })

  await date.fill('2026-10-01')

  await date.press('Enter')

  await expect(date).toHaveValue('01.10.2026')

  await page.reload()

  await expect(date).toHaveValue('01.10.2026')
})

test('the selected appearance is applied to the document after reload', async ({ page }) => {
  await page.goto('/settings')

  await page
    .getByRole('radiogroup', { name: 'Appearance' })
    .getByText('Dark', { exact: true })
    .click()

  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')

  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark')
})

for (const { language, label, next, previous, september, october, clear } of [
  {
    language: 'English',
    label: 'Planned test date',
    next: 'Next month',
    previous: 'Previous month',
    september: 'September',
    october: 'October',
    clear: 'Clear',
  },
  {
    language: 'Deutsch',
    label: 'Geplanter Prüfungstermin',
    next: 'Nächster Monat',
    previous: 'Vorheriger Monat',
    september: 'September',
    october: 'Oktober',
    clear: 'Löschen',
  },
] as const) {
  test(
    `${language} calendar supports popup selection, dismissal, and clearing`,
    { tag: '@webkit' },
    async ({ page }) => {
      await page.clock.install({ time: new Date('2026-09-26T12:00:00Z') })

      await page.goto('/dashboard')

      await chooseLanguage(page, language)

      await openNavigation(page, '/settings')

      const date = page.getByLabel(label, { exact: true })
      const nextMonth = page.getByRole('button', { name: next, exact: true })

      await date.click()

      await expect(
        page.getByRole('button', { name: `25 ${september} 2026`, exact: true }),
      ).toBeDisabled()
      await expect(
        page.getByRole('button', { name: `26 ${september} 2026`, exact: true }),
      ).toBeEnabled()

      await nextMonth.click()

      await expect(
        page.getByRole('button', { name: `15 ${october} 2026`, exact: true }),
      ).toBeVisible()

      await page.getByRole('button', { name: previous, exact: true }).click()

      await expect(
        page.getByRole('button', { name: `26 ${september} 2026`, exact: true }),
      ).toBeVisible()

      await nextMonth.click()

      await page.getByRole('button', { name: `15 ${october} 2026`, exact: true }).click()

      await expect(date).toHaveValue('15.10.2026')
      await expect(nextMonth).toHaveCount(0)

      await date.click()

      await expect(nextMonth).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(nextMonth).toHaveCount(0)
      await expect(date).toBeFocused()

      await page.getByRole('button', { name: clear, exact: true }).click()

      await expect(date).toHaveValue('')
      await expect(date).toBeEnabled()

      await date.click()

      await expect(nextMonth).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(date).toBeFocused()
    },
  )
}

test(
  'mobile navigation stays above appearance controls while scrolling',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 })

    await page.goto('/settings')

    const appearance = page.getByRole('radiogroup', { name: 'Appearance' })

    await expect(appearance).toBeVisible()

    const navigation = page.getByRole('navigation')
    const navigationBounds = await navigation.boundingBox()
    const appearanceBounds = await appearance.boundingBox()

    if (navigationBounds === null || appearanceBounds === null) {
      throw new Error('Settings controls and navigation must have visible bounds.')
    }

    await page.evaluate(
      (offset) => window.scrollBy(0, offset),
      appearanceBounds.y - navigationBounds.y,
    )

    await expect
      .poll(async () =>
        navigation.evaluate((element) => {
          const bounds = element.getBoundingClientRect()

          return element.contains(document.elementFromPoint(60, bounds.top + 20))
        }),
      )
      .toBe(true)

    await navigation.getByRole('link', { name: 'Home', exact: true }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
  },
)

import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'
import { bounds, waitForAppReady } from '../tests/helpers'

test('a touch tap clears the planned date while focused and after reload', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00Z'))

  await page.goto('/settings')

  await waitForAppReady(page)

  const date = page.getByRole('textbox', { name: 'Planned test date', exact: true })
  const clear = page.getByRole('button', { name: 'Clear', exact: true })

  for (const reload of [false, true]) {
    await date.fill('20.12.2026')

    await date.press('Enter')

    await page.keyboard.press('Escape')

    await expect(clear).toBeEnabled()

    if (reload) {
      await page.reload()

      await expect(date).toHaveValue('20.12.2026')
    }

    await clear.tap()

    await expect(date).toHaveValue('')

    await page.reload()

    await expect(date).toHaveValue('')
  }
})

test('answer groups have a name and translation and dialog controls have large touch targets', async ({
  page,
}) => {
  const question = sourceQuestion(308)

  await page.goto(`/study/${question.id}`)

  await waitForAppReady(page)

  await expect(
    page.getByRole('radiogroup', { name: question.question_de, exact: true }),
  ).toBeVisible()

  const translation = page.getByRole('button', { name: 'Show English translation' })
  const targetSize = await bounds(translation)

  expect(targetSize.width).toBeGreaterThanOrEqual(48)
  expect(targetSize.height).toBeGreaterThanOrEqual(48)

  await translation.tap()

  await expect(translation).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Enlarge question image', exact: true }).tap()

  const dialog = page.getByRole('dialog')
  const close = dialog.getByRole('button', { name: 'Close', exact: true }).first()
  const size = await bounds(close)

  expect(size.width).toBeGreaterThanOrEqual(44)
  expect(size.height).toBeGreaterThanOrEqual(44)

  await close.tap()

  await expect(dialog).toHaveCount(0)
})

test('the theme color follows the saved appearance', async ({ page }) => {
  await page.goto('/settings')

  await waitForAppReady(page)

  const theme = page.locator('meta[name="theme-color"]')

  await expect(theme).toHaveAttribute('content', '#ede3c8')

  await page
    .getByRole('radiogroup', { name: 'Appearance' })
    .getByText('Dark', { exact: true })
    .tap()

  await expect(theme).toHaveAttribute('content', '#2c353a')

  await page.reload()

  await expect(theme).toHaveAttribute('content', '#2c353a')

  await page
    .getByRole('radiogroup', { name: 'Appearance' })
    .getByText('Light', { exact: true })
    .tap()

  await expect(theme).toHaveAttribute('content', '#ede3c8')
})

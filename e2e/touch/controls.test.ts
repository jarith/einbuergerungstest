import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'
import { bounds, waitForOfflineReady } from '../tests/helpers'

test('a touch tap clears the planned date while focused and after reload', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00Z'))

  await page.goto('/settings')

  await waitForOfflineReady(page)

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

  await waitForOfflineReady(page)

  await expect(
    page.getByRole('radiogroup', { name: question.question_de, exact: true }),
  ).toBeVisible()

  // The switch's associated label is the full touch target, not its compact visual track.
  const translation = page.getByRole('switch', { name: 'Show English translation' })

  const targetHeight = await translation.evaluate((input) => {
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('The translation switch must have an input.')
    }

    return input.labels?.[0]?.getBoundingClientRect().height ?? 0
  })

  expect(targetHeight).toBeGreaterThanOrEqual(44)

  await translation.tap()

  await expect(translation).toBeChecked()

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

  await waitForOfflineReady(page)

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

import { expect, test } from '@playwright/test'

import { sourceQuestion, studyAnswer } from '../support/browser'
import { waitForAppReady } from '../tests/helpers'

test('touch navigation starts the destination at the top and focuses its heading', async ({
  page,
}) => {
  await page.goto('/dashboard')

  await waitForAppReady(page)

  await page.evaluate(() => window.scrollTo(0, 700))

  await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).tap()

  await expect(page).toHaveURL('/progress')
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeFocused()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('Next reveals the new question and keyboard answering preserves focus', async ({ page }) => {
  await page.goto('/study')

  await waitForAppReady(page)

  const answer = studyAnswer(page, 'A')

  await answer.focus()

  await answer.press('Space')

  await expect(answer).toBeChecked()
  await expect(answer).toBeFocused()

  await page.getByRole('button', { name: 'Next', exact: true }).tap()

  const heading = page.getByRole('heading', { name: sourceQuestion(2).question_de, exact: true })

  await expect(heading).toBeFocused()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('double tapping active Study scrolls up without restarting the session or adding history', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('/study')

  await waitForAppReady(page)

  await studyAnswer(page, 'A').tap()

  await expect(studyAnswer(page, 'A')).toBeChecked()

  const before = await page.evaluate(() => ({ url: location.href, entries: history.length }))

  // Compact study layouts can have less than 150px of overflow. Record the
  // browser's actual position so the test checks navigation, not content height.
  const position = await page.evaluate(() => {
    window.scrollTo(0, 150)

    return window.scrollY
  })

  expect(position).toBeGreaterThan(0)

  const study = page.getByRole('navigation').getByRole('link', { name: 'Study', exact: true })

  await study.tap()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position)

  await study.tap()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await expect(studyAnswer(page, 'A')).toBeChecked()
  await expect(studyAnswer(page, 'A')).toBeDisabled()
  expect(await page.evaluate(() => ({ url: location.href, entries: history.length }))).toEqual(
    before,
  )

  await page.evaluate((offset) => window.scrollTo(0, offset), position)

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position)

  await study.focus()

  await study.press('Enter')

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await page.evaluate((offset) => window.scrollTo(0, offset), position)

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position)

  await study.tap()

  // A browser-owned scroll gesture cancels the pointer before click activation.
  await study.dispatchEvent('pointercancel', { pointerType: 'touch' })

  await study.tap()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position)
})

test('Back preserves the expanded Progress list and its scroll position', async ({ page }) => {
  await page.goto('/progress')

  await waitForAppReady(page)

  const group = page.getByRole('region', { name: /^Constitution, rights/ })

  await group.getByRole('button', { name: 'Show next 10 questions', exact: true }).tap()

  const rows = group.getByRole('listitem')

  await expect(rows).toHaveCount(20)

  const row = rows.nth(15).getByRole('link')

  // Keep the taller question row clear of the fixed mobile navigation before measuring.
  await row.evaluate((element) => element.scrollIntoView({ block: 'center' }))

  const position = await page.evaluate(() => window.scrollY)

  await row.tap()

  await expect(page).toHaveURL(/\/progress\/questions\//)

  await page.goBack()

  await expect(rows).toHaveCount(20)

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(position, 0)
})

test('touch departure from a live test still requires confirmation', async ({ page }) => {
  await page.goto('/mock-test')

  await waitForAppReady(page)

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  await page.getByRole('button', { name: 'Start mock test', exact: true }).tap()

  await expect(page.getByRole('timer')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const activeUrl = page.url()

  await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).tap()

  const dialog = page.getByRole('dialog', { name: 'Leave this test?' })

  await dialog.getByRole('button', { name: 'Stay in test', exact: true }).tap()

  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(activeUrl)
})

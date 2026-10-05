import { expect, test } from '@playwright/test'

import { sourceQuestion, studyAnswer } from '../support/browser'
import { waitForOfflineReady } from '../tests/helpers'

test('touch navigation starts the destination at the top and focuses its heading', async ({
  page,
}) => {
  await page.goto('/dashboard')

  await waitForOfflineReady(page)

  await page.evaluate(() => window.scrollTo(0, 700))

  await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).tap()

  await expect(page).toHaveURL('/progress')
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeFocused()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('Next reveals the new question and keyboard answering preserves focus', async ({ page }) => {
  await page.goto('/study')

  await waitForOfflineReady(page)

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

  await waitForOfflineReady(page)

  await studyAnswer(page, 'A').tap()

  await expect(studyAnswer(page, 'A')).toBeChecked()

  const before = await page.evaluate(() => ({ url: location.href, entries: history.length }))

  await page.evaluate(() => window.scrollTo(0, 150))

  const study = page.getByRole('navigation').getByRole('link', { name: 'Study', exact: true })

  await study.tap()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(150)

  await study.tap()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await expect(studyAnswer(page, 'A')).toBeChecked()
  await expect(studyAnswer(page, 'A')).toBeDisabled()
  expect(await page.evaluate(() => ({ url: location.href, entries: history.length }))).toEqual(
    before,
  )

  await page.evaluate(() => window.scrollTo(0, 150))

  await study.focus()

  await study.press('Enter')

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await page.evaluate(() => window.scrollTo(0, 150))

  await study.tap()

  // A browser-owned scroll gesture cancels the pointer before click activation.
  await study.dispatchEvent('pointercancel', { pointerType: 'touch' })

  await study.tap()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(150)
})

test('Back preserves the expanded Progress list and its scroll position', async ({ page }) => {
  await page.goto('/progress')

  await waitForOfflineReady(page)

  await page.getByRole('button', { name: 'Show next 10 questions', exact: true }).tap()

  const rows = page.getByRole('main').getByRole('listitem')

  await expect(rows).toHaveCount(20)

  const row = rows.nth(15).getByRole('link')

  await row.scrollIntoViewIfNeeded()

  const position = await page.evaluate(() => window.scrollY)

  await row.tap()

  await expect(page).toHaveURL(/\/progress\/questions\//)

  await page.goBack()

  await expect(rows).toHaveCount(20)

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(position, 0)
})

test('touch departure from a live test still requires confirmation', async ({ page }) => {
  await page.goto('/mock-test')

  await waitForOfflineReady(page)

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

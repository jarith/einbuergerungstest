import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { seedProfile } from '../journeys/fixtures'
import { sourceQuestion, studyAnswer } from '../support/browser'

const expectScopedLinks = async (page: Page, base: string) => {
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(page.getByText('Loading…', { exact: true })).toHaveCount(0)

  const paths = await page.locator('a[href]').evaluateAll((links) =>
    links.flatMap((link) => {
      const href = link.getAttribute('href')

      if (href === null || href.startsWith('#') || link.hasAttribute('download')) {
        return []
      }

      const url = new URL(href, location.href)

      return url.origin === location.origin ? [url.pathname] : []
    }),
  )

  expect(paths).toEqual(
    expect.arrayContaining(
      ['dashboard', 'study', 'mock-test', 'progress', 'settings'].map((path) => `${base}/${path}`),
    ),
  )

  for (const path of paths) {
    expect(path).toMatch(
      new RegExp(`^${base}/(?:dashboard|study|mock-test|progress|settings)(?:/|$)`),
    )
  }
}

for (const mode of ['browser', 'installed'] as const) {
  test.describe(`${mode} app links`, { tag: '@webkit' }, () => {
    const base = mode === 'installed' ? '/pwa' : ''

    test.beforeEach(async ({ page }) => {
      if (mode === 'installed') {
        await page.addInitScript(() =>
          Object.defineProperty(navigator, 'standalone', { value: true }),
        )
      }
    })

    test('content, completion and error links retain the active app base', async ({ page }) => {
      await seedProfile(page)

      for (const path of [
        '/dashboard',
        '/study',
        `/study/groups/${sourceQuestion(1).group_id}`,
        '/progress',
        `/progress/questions/${sourceQuestion(1).id}`,
        '/progress?tab=mock-tests',
        '/progress/tests/completed-before-backup',
        '/settings',
        '/study/missing-question',
      ]) {
        await test.step(path, async () => {
          await page.goto(`${base}${path}`)

          await expect(page.getByRole('main')).toBeVisible()

          await expectScopedLinks(page, base)
        })
      }

      const last = sourceQuestion(310)

      for (const path of [
        `/study/${last.id}?mode=sequential`,
        `/study/groups/${last.group_id}/${last.id}`,
      ]) {
        await page.goto(`${base}${path}`)

        await page.getByRole('button', { name: 'Finish study', exact: true }).click()

        await expect(
          page.getByRole('button', { name: /Practise again|Review this group/ }),
        ).toBeVisible()

        await expectScopedLinks(page, base)
      }
    })

    test('mock submission and review navigation retain the active app base', async ({ page }) => {
      await page.goto(`${base}/dashboard`)

      await page.getByRole('link', { name: 'Start mock test', exact: true }).click()

      await expect(page).toHaveURL(`${base}/mock-test`)

      await page.getByRole('button', { name: 'Start mock test', exact: true }).click()

      await expect(studyAnswer(page, 'A')).toBeVisible()

      await expectScopedLinks(page, base)

      await page.getByRole('button', { name: 'Submit test', exact: true }).click()

      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Submit test', exact: true })
        .click()

      await expect(
        page.getByRole('heading', { name: 'Mock test / Completed', exact: true }),
      ).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`${base}/progress/tests/[^/]+$`))

      const reviewUrl = page.url()

      await expectScopedLinks(page, base)

      await page.getByRole('link', { name: 'Back to overview', exact: true }).click()

      await expect(page).toHaveURL(`${base}/progress?tab=mock-tests`)

      await page
        .getByRole('region', { name: 'Test history', exact: true })
        .getByRole('link')
        .click()

      await expect(page).toHaveURL(reviewUrl)

      await page.getByRole('link', { name: 'Start another mock test', exact: true }).click()

      await expect(page).toHaveURL(`${base}/mock-test`)
      await expect(page.getByRole('button', { name: 'Start mock test', exact: true })).toBeVisible()
    })
  })
}

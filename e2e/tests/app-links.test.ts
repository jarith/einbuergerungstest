import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { seedProfile } from '../journeys/fixtures'
import { sourceQuestion, studyAnswer } from '../support/browser'

const expectScopedLinks = async (
  page: Page,
  base: string,
  contentPaths: readonly string[] = [],
) => {
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(page.getByText('Loading…', { exact: true })).toHaveCount(0)

  const paths = await page.getByRole('link', { includeHidden: true }).evaluateAll((links) =>
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

  const learnerPath = new RegExp(`^${base}/(?:dashboard|study|mock-test|progress|settings)(?:/|$)`)

  expect(paths.filter((path) => !learnerPath.test(path))).toEqual([])

  const contentLinks = await page
    .getByRole('main')
    .getByRole('link', { includeHidden: true })
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

  expect(contentLinks).toEqual(expect.arrayContaining(contentPaths.map((path) => `${base}${path}`)))
}

for (const mode of ['browser', 'installed'] as const) {
  test.describe(`${mode} app links`, { tag: '@webkit' }, () => {
    const base = mode === 'installed' ? '/pwa' : ''

    test.beforeEach(async ({ page }) => {
      // testing-ignore: Installed-mode environment setup; all link assertions run in both modes.
      if (mode === 'installed') {
        await page.addInitScript(() =>
          Object.defineProperty(navigator, 'standalone', { value: true }),
        )
      }
    })

    for (const { name, path, content, links } of [
      {
        name: 'dashboard',
        path: '/dashboard',
        content: (page: Page) =>
          page.getByRole('heading', { name: 'Get ready for the citizenship test', exact: true }),
        links: ['/study', '/mock-test', `/study/groups/${sourceQuestion(1).group_id}`],
      },
      {
        name: 'all-question study',
        path: '/study',
        content: (page: Page) =>
          page.getByRole('heading', { name: sourceQuestion(1).question_de, exact: true }),
        links: ['/progress'],
      },
      {
        name: 'group study',
        path: `/study/groups/${sourceQuestion(1).group_id}`,
        content: (page: Page) =>
          page.getByRole('heading', { name: sourceQuestion(1).question_de, exact: true }),
        links: ['/dashboard', '/progress'],
      },
      {
        name: 'question status',
        path: '/progress',
        content: (page: Page) => page.getByRole('region', { name: 'Question status', exact: true }),
        links: [`/progress/questions/${sourceQuestion(1).id}`],
      },
      {
        name: 'question history',
        path: `/progress/questions/${sourceQuestion(1).id}`,
        content: (page: Page) =>
          page.getByRole('heading', { name: sourceQuestion(1).question_de, exact: true }),
        links: [`/study/${sourceQuestion(1).id}`, '/progress'],
      },
      {
        name: 'mock history',
        path: '/progress?tab=mock-tests',
        content: (page: Page) => page.getByRole('region', { name: 'Test history', exact: true }),
        links: ['/progress/tests/completed-before-backup'],
      },
      {
        name: 'completed mock review',
        path: '/progress/tests/completed-before-backup',
        content: (page: Page) =>
          page.getByRole('heading', { name: 'Mock test / Completed', exact: true }),
        links: ['/mock-test', '/progress?tab=mock-tests'],
      },
      {
        name: 'settings',
        path: '/settings',
        content: (page: Page) => page.getByRole('region', { name: 'Backup', exact: true }),
        links: [],
      },
      {
        name: 'missing question',
        path: '/study/missing-question',
        content: (page: Page) =>
          page
            .getByRole('alert')
            .getByText('This page could not be found. Return to the dashboard.', { exact: true }),
        links: ['/dashboard'],
      },
    ]) {
      test(`${name} links retain the active app base`, async ({ page }) => {
        await seedProfile(page)

        await page.goto(`${base}${path}`)

        await expect(content(page)).toBeVisible()

        await expectScopedLinks(page, base, links)
      })
    }

    const last = sourceQuestion(310)

    // testing-ignore: This loop declares independent named tests; it does not repeat assertions inside a test.
    for (const { name, path, links } of [
      {
        name: 'all-question completion',
        path: `/study/${last.id}?mode=sequential`,
        links: ['/progress', '/dashboard'],
      },
      {
        name: 'group completion',
        path: `/study/groups/${last.group_id}/${last.id}`,
        links: ['/dashboard'],
      },
    ]) {
      test(`${name} links retain the active app base`, async ({ page }) => {
        await seedProfile(page)

        await page.goto(`${base}${path}`)

        await page.getByRole('button', { name: 'Finish study', exact: true }).click()

        await expect(
          page.getByRole('button', { name: /Practise again|Review this group/ }),
        ).toBeVisible()

        await expectScopedLinks(page, base, links)
      })
    }

    test('mock submission and review navigation retain the active app base', async ({ page }) => {
      await page.goto(`${base}/dashboard`)

      await page.getByRole('link', { name: 'Start mock test', exact: true }).click()

      await expect(page).toHaveURL(`${base}/mock-test`)

      await page.getByRole('button', { name: 'Start mock test', exact: true }).click()

      await expect(studyAnswer(page, 'A')).toBeVisible()

      await expectScopedLinks(page, base, ['/dashboard'])

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

      await expectScopedLinks(page, base, ['/mock-test', '/progress?tab=mock-tests'])

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

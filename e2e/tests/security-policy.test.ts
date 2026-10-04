import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'

declare global {
  interface Window {
    securityViolations: string[]
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.securityViolations = []

    document.addEventListener('securitypolicyviolation', (event) => {
      window.securityViolations.push(`${event.effectiveDirective}: ${event.blockedURI}`)
    })
  })
})

test(
  'the production policy permits public pages, settings, and study',
  { tag: '@webkit' },
  async ({ page }) => {
    for (const path of ['/', '/en/', '/settings']) {
      const response = await page.goto(path)

      expect(response?.headers()).toHaveProperty('content-security-policy')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => window.securityViolations)).toEqual([])
    }

    await page.getByLabel('Planned test date', { exact: true }).click()

    await expect(page.getByRole('button', { name: 'Next month', exact: true })).toBeVisible()

    await page.keyboard.press('Escape')

    const question = sourceQuestion(21)
    const response = await page.goto(`/study/${question.id}`)

    expect(response?.headers()).toHaveProperty('content-security-policy')
    await expect(
      page.getByRole('img', { name: 'Illustration for question 21', exact: true }),
    ).toBeVisible()

    await page.getByRole('radio', { name: new RegExp(`^${question.correct_option}\\b`) }).click()

    await expect(page.getByRole('note').filter({ hasText: 'Correct' })).toBeVisible()
    expect(await page.evaluate(() => window.securityViolations)).toEqual([])
  },
)

test('offline learner HTML retains its enforced policy', async ({ page, context }) => {
  test.setTimeout(60_000)

  await page.goto('/dashboard')

  await expect(
    page
      .getByRole('contentinfo', { includeHidden: true })
      .getByText('Ready offline', { exact: true }),
  ).toHaveCount(1, { timeout: 45_000 })

  await page.reload()

  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)

  await context.setOffline(true)

  const question = sourceQuestion(21)
  const response = await page.goto(`/study/${question.id}`)

  expect(response?.headers()).toHaveProperty('content-security-policy')
  await expect(
    page.getByRole('img', { name: 'Illustration for question 21', exact: true }),
  ).toBeVisible()

  await page.getByRole('radio', { name: new RegExp(`^${question.correct_option}\\b`) }).click()

  await expect(page.getByRole('note').filter({ hasText: 'Correct' })).toBeVisible()
  expect(await page.evaluate(() => window.securityViolations)).toEqual([])
})

test(
  'the production policy permits the existing tracker and gateway',
  { tag: '@webkit' },
  async ({ page }) => {
    // Replace the external network boundary; exercise CSP without sending real analytics.
    await page.route('https://cloud.umami.is/script.js', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'fetch("https://gateway.umami.is/api/send").then(() => { document.body.dataset.trackerConnected = "true" })',
      }),
    )

    await page.route('https://gateway.umami.is/api/send', (route) =>
      route.fulfill({
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: '{}',
      }),
    )

    await page.goto('/en/')

    await expect(page.locator('body')).toHaveAttribute('data-tracker-connected', 'true')
    expect(await page.evaluate(() => window.securityViolations)).toEqual([])
  },
)

test(
  'the production policy blocks injected scripts and unapproved connections',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.route('https://untrusted.invalid/**', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'document.body.dataset.injected = "external"',
      }),
    )

    await page.goto('/en/')

    const connectionAllowed = await page.evaluate(async () => {
      const inline = document.createElement('script')
      inline.textContent = 'document.body.dataset.injected = "inline"'

      document.head.append(inline)

      const external = document.createElement('script')
      external.src = 'https://untrusted.invalid/script.js'

      document.head.append(external)

      try {
        await fetch('https://untrusted.invalid/collect')

        return true
      } catch {
        return false
      }
    })

    expect(connectionAllowed).toBe(false)

    await expect
      .poll(() => page.evaluate(() => window.securityViolations))
      .toEqual(
        expect.arrayContaining([
          expect.stringContaining('script-src-elem: inline'),
          expect.stringContaining('script-src-elem: https://untrusted.invalid'),
          expect.stringContaining('connect-src: https://untrusted.invalid'),
        ]),
      )

    expect(await page.evaluate(() => document.body.dataset['injected'])).toBeUndefined()
  },
)

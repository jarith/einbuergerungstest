import { expect, test } from '@playwright/test'

import { expectViewportFit } from './helpers'

const origin = 'https://einbuergerungstest.jarith.dev'

for (const language of ['de', 'en'] as const) {
  const path = language === 'de' ? '/' : '/en/'

  test(`${language} public page delivers content and metadata without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto(`http://127.0.0.1:4173${path}`)

    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      language === 'de' ? 'Einbürgerungstest Berlin' : 'Berlin citizenship test',
    )
    await expect(page.locator('head title')).toHaveCount(1)
    await expect(page).toHaveTitle(/310/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /310/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}${path}`)
    await expect(page.locator('link[hreflang="de"]')).toHaveAttribute('href', `${origin}/`)
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', `${origin}/en/`)
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${origin}/`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `${origin}${path}`,
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `${origin}/social/berlin-test.png`,
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      process.env['SITE_INDEXABLE'] === 'true' ? 'index, follow' : 'noindex, follow',
    )
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(7)
    await expect(
      page
        .getByRole('link', { name: language === 'de' ? 'Jetzt üben' : 'Start practising' })
        .first(),
    ).toHaveAttribute('href', '/study')

    await page.setViewportSize({ width: 360, height: 800 })

    await expectViewportFit(page)

    await page
      .getByRole('link', { name: language === 'de' ? 'English' : 'Deutsch', exact: true })
      .click()

    await expect(page.locator('html')).toHaveAttribute('lang', language === 'de' ? 'en' : 'de')

    await context.close()
  })
}

test('public pages need neither learner storage nor question-bank loading', async ({ page }) => {
  const bankRequests: string[] = []

  page.on('request', (request) => {
    if (request.url().includes('questionbank')) {
      bankRequests.push(request.url())
    }
  })

  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      get: () => {
        throw new Error('Storage unavailable')
      },
    })

    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Storage unavailable')
      },
    })
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Einbürgerungstest Berlin')

  await page.getByRole('link', { name: 'English', exact: true }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Berlin citizenship test')
  expect(bankRequests).toEqual([])
})

test('training keeps one title through navigation and stays non-indexable', async ({
  page,
  request,
}) => {
  const response = await request.get('/progress')

  expect(await response.text()).toContain('name="robots" content="noindex, follow"')

  await page.goto('/en/')

  await page.getByRole('link', { name: 'Start practising', exact: true }).first().click()

  await expect(page).toHaveTitle('Study · Einbürgerungstest Berlin')
  await expect(page.locator('head title')).toHaveCount(1)

  await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

  await expect(page).toHaveTitle('Progress · Einbürgerungstest Berlin')
  await expect(page.locator('head title')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})

test('discovery includes only public canonical pages and unknown URLs return 404', async ({
  request,
  page,
}) => {
  const sitemap = await request.get('/sitemap.xml')
  const body = await sitemap.text()

  if (process.env['SITE_INDEXABLE'] === 'true') {
    expect(body.match(/<loc>/g)).toHaveLength(2)
    expect(body).toContain(`<loc>${origin}/</loc>`)
    expect(body).toContain(`<loc>${origin}/en/</loc>`)
  } else {
    expect(body).not.toContain('<loc>')
  }

  const robots = await request.get('/robots.txt')

  expect(await robots.text()).toContain('Allow: /')

  const image = await request.get('/social/berlin-test.png')

  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toContain('image/png')

  const missing = await page.goto('/this-page-does-not-exist')

  expect(missing?.status()).toBe(404)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seite nicht gefunden')

  const english = await request.get('/en?ref=test', { maxRedirects: 0 })

  expect(english.status()).toBe(308)
  expect(english.headers()['location']).toBe('/en/?ref=test')
})

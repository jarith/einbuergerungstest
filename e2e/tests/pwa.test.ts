import { expect, test } from '@playwright/test'

test('the deployed manifest supports standalone launch with loadable icons', async ({ page }) => {
  await page.goto('/dashboard')

  // Installation metadata lives in the document head and has no accessible role.
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')

  if (href === null || href === '') {
    throw new Error('The page must link to its web app manifest.')
  }

  const manifestUrl = new URL(href, page.url()).href
  const response = await page.request.get(manifestUrl)

  expect(response.ok()).toBe(true)

  const manifest: unknown = await response.json()

  expect(manifest).toMatchObject({
    name: expect.any(String),
    display: 'standalone',
    start_url: '/dashboard',
    icons: expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
      expect.objectContaining({ sizes: '192x192', purpose: 'maskable' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    ]),
  })

  // Validate the browser-owned JSON before using its asset URLs.
  /* oxlint-disable app/no-runtime-typeof -- Validate the manifest JSON at its network boundary. */
  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    !('icons' in manifest) ||
    !Array.isArray(manifest.icons)
  ) {
    throw new Error('The manifest must declare an icon array.')
  }

  const entries: readonly unknown[] = manifest.icons

  const urls = entries.map((entry) => {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      !('src' in entry) ||
      typeof entry.src !== 'string'
    ) {
      throw new Error('Every manifest icon must declare a URL.')
    }

    return new URL(entry.src, manifestUrl).href
  })

  /* oxlint-enable app/no-runtime-typeof */

  const icons = await page.evaluate(
    async (sources) =>
      await Promise.all(
        sources.map(async (src) => {
          const image = new Image()

          image.src = src

          await image.decode()

          return { width: image.naturalWidth, height: image.naturalHeight }
        }),
      ),
    urls,
  )

  expect(icons).toEqual(
    expect.arrayContaining([
      { width: 192, height: 192 },
      { width: 512, height: 512 },
    ]),
  )
})

test('public and learner HTML expose loadable browser and Apple icons', async ({ page }) => {
  for (const path of ['/', '/en/', '/dashboard']) {
    await page.goto(path)

    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
      'href',
      '/favicon.svg',
    )
    await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute(
      'sizes',
      '96x96',
    )
    await expect(page.locator('link[rel="icon"][type="image/x-icon"]')).toHaveAttribute(
      'href',
      '/favicon.ico',
    )
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes', '180x180')
  }

  const sources = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

  for (const source of sources) {
    if (source === null) {
      throw new Error('Every icon link must have an asset URL.')
    }

    const response = await page.request.get(source)

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toMatch(/^image\//)
  }

  const dimensions = await page.evaluate(async () => {
    const paths = [
      '/icons/favicon-96.png',
      '/icons/apple-touch-icon.png',
      '/favicon.svg',
      '/favicon.ico',
    ]

    return Promise.all(
      paths.map(async (src) => {
        const image = new Image()

        image.src = src

        await image.decode()

        return { width: image.naturalWidth, height: image.naturalHeight }
      }),
    )
  })

  expect(dimensions).toEqual([
    { width: 96, height: 96 },
    { width: 180, height: 180 },
    { width: 512, height: 512 },
    { width: 48, height: 48 },
  ])
})

test('installation guidance explains the supported iPhone and iPad path', async ({ page }) => {
  await page.goto('/dashboard')

  await page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click()

  await page.getByRole('link', { name: /iPhone.*iPad/ }).click()

  await expect(page.getByRole('main')).toContainText('Safari')
  await expect(page.getByRole('main')).toContainText('Home Screen')
})

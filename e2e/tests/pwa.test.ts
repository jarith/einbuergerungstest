import { expect, test } from '@playwright/test'

test('the deployed manifest supports standalone launch with loadable icons', async ({ page }) => {
  await page.goto('/')

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
    start_url: '/',
    icons: expect.arrayContaining([
      expect.objectContaining({ src: expect.any(String), sizes: '192x192' }),
      expect.objectContaining({ src: expect.any(String), sizes: '512x512' }),
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

test('installation guidance explains the supported iPhone and iPad path', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click()

  await page.getByRole('link', { name: /iPhone.*iPad/ }).click()

  await expect(page.getByRole('main')).toContainText('Safari')
  await expect(page.getByRole('main')).toContainText('Home Screen')
})

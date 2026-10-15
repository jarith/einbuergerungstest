import type { Locator } from '@playwright/test'
import { expect, test } from '@playwright/test'

const expectNumberedSteps = async (guide: Locator) => {
  const expectedNumbers = ['1', '2', '3', '4']

  const numbers = guide.getByRole('listitem').getByText(/^\d+$/)

  await expect(numbers).toHaveText(expectedNumbers)

  await expect
    .poll(() =>
      numbers.evaluateAll(
        (elements) =>
          elements.filter((element) => !element.checkVisibility({ visibilityProperty: true }))
            .length,
      ),
    )
    .toBe(0)
}

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
    start_url: '/pwa/dashboard',
    scope: '/pwa/',
    id: '/',
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

for (const path of ['/', '/en/', '/dashboard']) {
  test(`${path} exposes loadable browser and Apple icons`, async ({ page }) => {
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

    const sources = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

    const loaded = await Promise.all(
      sources.map(async (source) => {
        if (source === null) {
          throw new Error('Every icon link must have an asset URL.')
        }

        const response = await page.request.get(source)

        return { source, ok: response.ok(), contentType: response.headers()['content-type'] }
      }),
    )

    expect(loaded).toEqual(
      sources.map((source) => ({
        source,
        ok: true,
        contentType: expect.stringMatching(/^image\//),
      })),
    )

    const dimensions = await page.evaluate(async (paths) => {
      return Promise.all(
        paths.map(async (src) => {
          if (src === null) {
            throw new Error('Every icon link must have an asset URL.')
          }
          const image = new Image()
          image.src = src

          await image.decode()

          return { width: image.naturalWidth, height: image.naturalHeight }
        }),
      )
    }, sources)

    expect(dimensions).toEqual(
      expect.arrayContaining([
        { width: 96, height: 96 },
        { width: 180, height: 180 },
        { width: 512, height: 512 },
        { width: 48, height: 48 },
      ]),
    )
  })
}

for (const language of ['English', 'Deutsch'] as const) {
  for (const { width, sideBySide, axis, extent, layout } of [
    { width: 360, sideBySide: false, axis: 'y', extent: 'height', layout: 'stacked' },
    { width: 834, sideBySide: true, axis: 'x', extent: 'width', layout: 'side by side' },
    { width: 1024, sideBySide: false, axis: 'y', extent: 'height', layout: 'stacked' },
    { width: 1440, sideBySide: true, axis: 'x', extent: 'width', layout: 'side by side' },
  ] as const) {
    test(
      `Settings shows numbered installation guides ${layout} in ${language} at ${width}px`,
      { tag: '@webkit' },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })

        await page.goto('/settings')

        await page
          .getByRole('radiogroup', { name: 'Interface language' })
          .getByText(language, { exact: true })
          .click()

        const safari = page.getByRole('region', {
          name:
            language === 'English'
              ? 'How to install from Safari'
              : 'So installierst du die App aus Safari',
          exact: true,
        })

        const chrome = page.getByRole('region', {
          name:
            language === 'English'
              ? 'How to install from Chrome'
              : 'So installierst du die App aus Chrome',
          exact: true,
        })

        await expect(safari.getByRole('listitem')).toHaveCount(4)
        await expect(chrome.getByRole('listitem')).toHaveCount(4)

        await expectNumberedSteps(safari)

        await expectNumberedSteps(chrome)

        await expect(page.getByRole('main')).toContainText(
          language === 'English'
            ? 'Copy your Safari progress'
            : 'Übertrage deinen Safari-Fortschritt',
        )
        await expect(page.locator('a[href="/settings/installation"]')).toHaveCount(0)

        await expect(page).toHaveURL(/\/settings$/)

        await expect
          .poll(async () => {
            const ios = await safari.boundingBox()
            const android = await chrome.boundingBox()

            if (ios === null || android === null) {
              throw new Error('Both installation guides must be rendered.')
            }

            return Math.abs(ios.y - android.y) < 1 && android.x > ios.x
          })
          .toBe(sideBySide)

        await expect
          .poll(async () => {
            const ios = await safari.boundingBox()
            const android = await chrome.boundingBox()

            if (ios === null || android === null) {
              throw new Error('Both installation guides must be rendered.')
            }

            return android[axis] - ios[axis] - ios[extent]
          })
          .toBeGreaterThanOrEqual(0)

        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true)
      },
    )
  }
}

for (const path of ['/settings/installation', '/settings/installation/']) {
  test(`${path} returns 404 while Settings remains available`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 })

    expect(response.status()).toBe(404)
    expect(response.headers()['location']).toBeUndefined()

    const settings = await request.get('/settings', { maxRedirects: 0 })

    expect(settings.status()).toBe(200)
    expect(settings.headers()['location']).toBeUndefined()
  })
}

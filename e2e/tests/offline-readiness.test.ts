/* oxlint-disable typescript/unbound-method -- Native method probes restore and invoke the original with its receiver. */

import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import questionBank from '../../web/public/questionbank-berlin.json' with { type: 'json' }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { value: true })
  })
})

const readyStatus = (page: Page) =>
  page.getByRole('contentinfo', { includeHidden: true }).getByText('Ready offline', { exact: true })

test(
  'a fresh standalone copy prepares the complete bank and every illustration',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    const images = [
      ...new Set(
        questionBank.questions.flatMap((question) => [
          ...(question.question_image_resource === undefined
            ? []
            : [question.question_image_resource]),
          ...(question.question_image_variants ?? []).map((variant) => variant.resource),
        ]),
      ),
    ]

    // Read Cache Storage directly: fetching here could hide an omitted precache entry.
    const cached = await page.evaluate(async (paths) => {
      const bank = await caches.match(new URL('/questionbank-berlin.json', location.origin), {
        ignoreSearch: true,
      })

      return {
        bank: await bank?.json(),
        images: await Promise.all(
          paths.map(async (path) => {
            const response = await caches.match(new URL(path, location.origin), {
              ignoreSearch: true,
            })

            return {
              path,
              ok: response?.ok,
              bytes: (await response?.arrayBuffer())?.byteLength ?? 0,
            }
          }),
        ),
      }
    }, images)

    expect(cached.bank).toEqual(questionBank)
    expect(cached.images).toHaveLength(images.length)

    for (const image of cached.images) {
      expect(image.ok, image.path).toBe(true)
      expect(image.bytes, image.path).toBeGreaterThan(0)
    }
  },
)

test(
  'a delayed cache check recovers without a false download error',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    await page.evaluate(() => {
      const original = ServiceWorker.prototype.postMessage

      ServiceWorker.prototype.postMessage = function (message, transfer) {
        ServiceWorker.prototype.postMessage = original

        setTimeout(
          () => original.call(this, message, Array.isArray(transfer) ? { transfer } : transfer),
          11_000,
        )
      }

      window.dispatchEvent(new Event('focus'))
    })

    // Cross the actual ten-second message deadline, rather than mocking the model.
    await page.waitForTimeout(10_500)

    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)
    await expect(readyStatus(page)).toHaveCount(1)
  },
)

test(
  'an unverified fresh copy retries and recovers on return to the app',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.addInitScript(() => {
      const original = ServiceWorker.prototype.postMessage

      ServiceWorker.prototype.postMessage = function (message, transfer) {
        if (document.documentElement.dataset['allowVerification'] === 'true') {
          return original.call(this, message, Array.isArray(transfer) ? { transfer } : transfer)
        }

        if (Array.isArray(transfer) && transfer[0] instanceof MessagePort) {
          transfer[0].postMessage(null)
        }
      }
    })

    await page.goto('/dashboard')

    await expect(
      page.getByText('Offline readiness could not be checked.', { exact: true }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(readyStatus(page)).toHaveCount(0)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await page.evaluate(() => {
      document.documentElement.dataset['allowVerification'] = 'true'

      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    })

    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline readiness could not be checked.', { exact: true }),
    ).toHaveCount(0)
  },
)

test(
  'a superseded check cannot overwrite the newer successful result',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    await page.evaluate(() => {
      const original = ServiceWorker.prototype.postMessage

      ServiceWorker.prototype.postMessage = function (message, transfer) {
        ServiceWorker.prototype.postMessage = original

        if (
          message === 'CHECK_OFFLINE' &&
          Array.isArray(transfer) &&
          transfer[0] instanceof MessagePort
        ) {
          const port = transfer[0]

          setTimeout(() => port.postMessage(['questionbank-berlin.json']), 500)
        }
      }

      window.dispatchEvent(new Event('focus'))

      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    })

    await page.waitForTimeout(750)

    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)
  },
)

test(
  'a missing image is reported and retry restores the complete cache',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    const image = questionBank.questions.find(
      (question) => question.question_image_resource !== undefined,
    )?.question_image_resource

    if (image === undefined) {
      throw new Error('The bank must include an illustration for the cache recovery test.')
    }

    await page.evaluate(async (path) => {
      for (const name of await caches.keys()) {
        const cache = await caches.open(name)

        await cache.delete(new URL(path, location.origin), { ignoreSearch: true })
      }

      document.dispatchEvent(new Event('visibilitychange'))
    }, image)

    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toBeVisible()
    await expect(page.getByText(`Missing resources: ${image}`, { exact: true })).toBeVisible()
    await expect(readyStatus(page)).toHaveCount(0)

    await page.getByRole('button', { name: 'Try again', exact: true }).click()

    await expect(readyStatus(page)).toHaveCount(1)
  },
)

test(
  'a failed update preserves the prepared current copy',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    await page.evaluate(() => {
      ServiceWorkerRegistration.prototype.update = () =>
        Promise.reject(new Error('Update network failure'))

      window.dispatchEvent(new Event('online'))
    })

    await expect(
      page.getByText('An update could not be downloaded.', { exact: false }),
    ).toHaveCount(0)
    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)
  },
)

test(
  'backgrounding cancels the check and foregrounding verifies again',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    await page.clock.install()

    await page.evaluate(() => {
      const original = ServiceWorker.prototype.postMessage

      ServiceWorker.prototype.postMessage = function (message, transfer) {
        ServiceWorker.prototype.postMessage = original

        setTimeout(
          () => original.call(this, message, Array.isArray(transfer) ? { transfer } : transfer),
          11_000,
        )
      }

      window.dispatchEvent(new Event('focus'))

      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })

      document.dispatchEvent(new Event('visibilitychange'))
    })

    await page.clock.fastForward(12_000)

    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })

      document.dispatchEvent(new Event('visibilitychange'))
    })

    await expect(readyStatus(page)).toHaveCount(1)
  },
)

test(
  'a failed replacement worker does not invalidate the active cache',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration('/pwa/')

      if (registration === undefined) {
        throw new Error('The prepared app must have a service worker registration.')
      }

      const installing = new EventTarget()

      Object.defineProperty(installing, 'state', { configurable: true, value: 'installing' })

      Object.defineProperty(registration, 'installing', { configurable: true, value: installing })

      registration.dispatchEvent(new Event('updatefound'))

      Object.defineProperty(installing, 'state', { value: 'redundant' })

      installing.dispatchEvent(new Event('statechange'))

      Reflect.deleteProperty(registration, 'installing')
    })

    await expect(
      page.getByText('An update could not be downloaded.', { exact: false }),
    ).toHaveCount(0)
    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)
  },
)

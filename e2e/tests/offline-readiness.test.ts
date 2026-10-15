/* oxlint-disable typescript/unbound-method -- Native method probes restore and invoke the original with its receiver. */

import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import questionBank from '../../web/public/questionbank-berlin.json' with { type: 'json' }
import { sourceQuestion, studyAnswer } from '../support/browser'
import { evictCachedBank, exposeStaleActivationState, holdNextCacheCheck } from '../support/offline'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { value: true })
  })
})

const readyStatus = (page: Page) =>
  page.getByRole('contentinfo', { includeHidden: true }).getByText('Ready offline', { exact: true })

const expectPreparedStudyUsable = async (page: Page) => {
  const question = sourceQuestion(21)
  const imagePath = question.question_image_resource

  if (imagePath === undefined) {
    throw new Error('The illustrated study question must name its image resource.')
  }

  // Inspect the prepared copy before navigating: a network fetch must not repair
  // missing cached resources and conceal damage from the failed update.
  const cached = await page.evaluate(async (illustration) => {
    const app = await caches.match(new URL('/app.html', location.origin), { ignoreSearch: true })

    const bank = await caches.match(new URL('/questionbank-berlin.json', location.origin), {
      ignoreSearch: true,
    })

    const image = await caches.match(new URL(illustration, location.origin), { ignoreSearch: true })

    return {
      app: { ok: app?.ok, bytes: (await app?.arrayBuffer())?.byteLength ?? 0 },
      bank: await bank?.json(),
      image: { ok: image?.ok, bytes: (await image?.arrayBuffer())?.byteLength ?? 0 },
    }
  }, imagePath)

  expect(cached.app.ok).toBe(true)
  expect(cached.app.bytes).toBeGreaterThan(0)
  expect(cached.bank).toEqual(questionBank)
  expect(cached.image.ok).toBe(true)
  expect(cached.image.bytes).toBeGreaterThan(0)

  await page.goto(`/pwa/study/${question.id}`)

  const illustration = page.getByRole('img', { name: 'Illustration for question 21', exact: true })

  await expect(illustration).toBeVisible()

  await expect
    .poll(() =>
      illustration.evaluate(
        (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true)

  const answer = studyAnswer(page, question.correct_option)

  await answer.click()

  await expect(answer).toBeChecked()
  await expect(answer).toContainText('Correct')
}

test(
  'complete downloads need activation confirmation and retry can recover',
  { tag: '@webkit' },
  async ({ page }) => {
    await exposeStaleActivationState(page)

    await page.addInitScript(() => {
      const getScriptURL = Object.getOwnPropertyDescriptor(
        ServiceWorker.prototype,
        'scriptURL',
      )?.get

      if (getScriptURL === undefined) {
        throw new Error('The browser must expose the worker identity.')
      }

      Object.defineProperty(ServiceWorker.prototype, 'scriptURL', {
        configurable: true,
        get() {
          const actual: unknown = getScriptURL.call(this)

          return document.documentElement.dataset['allowActivation'] === 'true'
            ? actual
            : new URL('/pwa/unconfirmed-worker.js', location.origin).href
        },
      })
    })

    await page.goto('/settings')

    await expect(
      page.getByText('Downloads are complete. Offline access is not confirmed yet.', {
        exact: true,
      }),
    ).toBeVisible()
    await expect(readyStatus(page)).toHaveCount(0)

    await page.evaluate(() => {
      document.documentElement.dataset['allowActivation'] = 'true'
    })

    await page.getByRole('button', { name: 'Try again', exact: true }).click()

    await expect(readyStatus(page)).toHaveCount(1)
  },
)

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
    expect(cached.images.filter((image) => image.ok !== true || image.bytes === 0)).toEqual([])
  },
)

test(
  'a delayed cache check retries and confirms the repaired resources',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    const bank = await evictCachedBank(page)

    await page.evaluate(() => window.dispatchEvent(new Event('focus')))

    await expect(
      page.getByText('Missing resources: questionbank-berlin.json', { exact: true }),
    ).toBeVisible()

    await bank.evaluate((entry) => entry.restore())

    await page.clock.install()

    const delayed = await holdNextCacheCheck(page)

    await page.evaluate(() => window.dispatchEvent(new Event('focus')))

    await delayed.evaluate((check) => check.captured)

    // Characterize the existing 10-second message deadline and 1-second retry;
    // these durations are implementation choices, not product timing requirements.
    // The first response is still held, so only a subsequent real cache
    // verification can clear the error.
    await page.clock.fastForward(10_000)

    await page.clock.fastForward(1_000)

    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await delayed.evaluate((check) => check.release())

    await delayed.dispose()

    await bank.dispose()
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

        // testing-ignore -- The browser message fake validates its transfer port; no assertions branch here.
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

    const bank = await evictCachedBank(page)

    await page.evaluate(() => window.dispatchEvent(new Event('focus')))

    await expect(
      page.getByText('Missing resources: questionbank-berlin.json', { exact: true }),
    ).toBeVisible()

    const obsolete = await holdNextCacheCheck(page)

    await page.evaluate(() => window.dispatchEvent(new Event('focus')))

    await obsolete.evaluate((check) => check.captured)

    await bank.evaluate((entry) => entry.restore())

    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
    )

    await expect(readyStatus(page)).toHaveCount(1)

    await obsolete.evaluate((check) => check.release())

    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await obsolete.dispose()

    await bank.dispose()
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
      // testing-ignore -- Evict the browser cache fixture; this loop contains no assertions.
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

    const failedUpdate = await page.evaluateHandle(() => {
      const completed = Promise.withResolvers<void>()

      ServiceWorkerRegistration.prototype.update = () => {
        const rejected = Promise.reject(new Error('Update network failure'))

        void rejected.catch(() => completed.resolve())

        return rejected
      }

      return { completed: completed.promise }
    })

    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'))
    })

    await failedUpdate.evaluate((update) => update.completed)

    await failedUpdate.dispose()

    await expect(
      page.getByText('An update could not be downloaded.', { exact: false }),
    ).toHaveCount(0)
    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await expectPreparedStudyUsable(page)
  },
)

test(
  'backgrounding cancels the check and foregrounding verifies again',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    const bank = await evictCachedBank(page)
    const backgrounded = await holdNextCacheCheck(page)

    await page.evaluate(() => window.dispatchEvent(new Event('focus')))

    await backgrounded.evaluate((check) => check.captured)

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })

      document.dispatchEvent(new Event('visibilitychange'))
    })

    await backgrounded.evaluate((check) => check.release())

    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })

      document.dispatchEvent(new Event('visibilitychange'))
    })

    await expect(
      page.getByText('Missing resources: questionbank-berlin.json', { exact: true }),
    ).toBeVisible()
    await expect(readyStatus(page)).toHaveCount(0)

    await backgrounded.dispose()

    await bank.dispose()
  },
)

test(
  'a redundant-worker event rechecks the active cache and retains offline readiness',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await expect(readyStatus(page)).toHaveCount(1)

    const verification = await holdNextCacheCheck(page)

    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration('/pwa/')

      if (registration === undefined) {
        throw new Error('The prepared app must have a service worker registration.')
      }

      // Event-handler integration only. Real failed installations are exercised
      // by updates/automatic-updates.test.ts with the release transport.
      const installing = new EventTarget()

      Object.defineProperty(installing, 'state', { configurable: true, value: 'installing' })

      Object.defineProperty(registration, 'installing', { configurable: true, value: installing })

      registration.dispatchEvent(new Event('updatefound'))

      Object.defineProperty(installing, 'state', { value: 'redundant' })

      installing.dispatchEvent(new Event('statechange'))

      Reflect.deleteProperty(registration, 'installing')
    })

    // The redundant-worker handler must trigger and complete a real cache check.
    await verification.evaluate((check) => check.captured)

    await verification.evaluate((check) => check.release())

    await verification.dispose()

    await expect(
      page.getByText('An update could not be downloaded.', { exact: false }),
    ).toHaveCount(0)
    await expect(readyStatus(page)).toHaveCount(1)
    await expect(
      page.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)

    await expectPreparedStudyUsable(page)
  },
)

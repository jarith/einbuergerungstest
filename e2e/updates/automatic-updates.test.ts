import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { sourceQuestion, studyAnswer } from '../support/browser'
import { exposeStaleActivationState } from '../support/offline'
import { test } from '../support/releases'

const version = (page: Page, release: string) =>
  page.getByText(`App version: ${release}`, { exact: true })

const ready = (page: Page) =>
  page.getByRole('contentinfo', { includeHidden: true }).getByText('Ready offline', { exact: true })

const foreground = async (page: Page) => {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })

    document.dispatchEvent(new Event('visibilitychange'))

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })

    document.dispatchEvent(new Event('visibilitychange'))

    window.dispatchEvent(new Event('focus'))
  })
}

test.describe('installed PWA release transitions', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() =>
      Object.defineProperty(navigator, 'standalone', { value: true }),
    )
  })

  test('a stale activating state verifies the real worker and survives an offline reload', async ({
    page,
    deployment,
    setOffline,
  }) => {
    await exposeStaleActivationState(page)

    await page.goto(`${deployment.origin}/pwa/settings`)

    await expect(ready(page)).toHaveCount(1)
    expect(await page.evaluate(() => navigator.serviceWorker.controller?.state)).toBe('activating')

    await setOffline(true)

    await page.reload()

    await expect(ready(page)).toHaveCount(1)
    await expect(version(page, 'release-a')).toBeVisible()
  })

  test('an online cold launch automatically downloads and runs the new release', async ({
    page,
    context,
    deployment,
    setOffline,
  }) => {
    await page.goto(`${deployment.origin}/pwa/settings`)

    await expect(version(page, 'release-a')).toBeVisible()
    await expect(ready(page)).toHaveCount(1)

    await page.close()

    deployment.publish('release-b')

    const reopened = await context.newPage()

    await reopened.goto(`${deployment.origin}/pwa/settings`)

    // No page.reload(), update message, button, or second launch.
    await expect(version(reopened, 'release-b')).toBeVisible({ timeout: 20_000 })
    await expect(ready(reopened)).toHaveCount(1)
    await expect(reopened.getByText('An update is downloaded', { exact: false })).toHaveCount(0)

    await setOffline(true)

    await reopened.reload()

    await expect(version(reopened, 'release-b')).toBeVisible()
  })

  test('returning online to a suspended app updates automatically and preserves progress', async ({
    page,
    deployment,
  }) => {
    const question = sourceQuestion(1)

    await page.goto(`${deployment.origin}/pwa/study/${question.id}`)

    await expect(ready(page)).toHaveCount(1)

    await studyAnswer(page, question.correct_option).click()

    await expect(studyAnswer(page, question.correct_option)).toContainText('Correct')

    await page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click()

    await expect(version(page, 'release-a')).toBeVisible()

    deployment.publish('release-b')

    await foreground(page)

    await expect(version(page, 'release-b')).toBeVisible({ timeout: 20_000 })

    await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

    await expect(page.getByText('Learning · 1', { exact: true })).toBeVisible()
  })

  test('an offline launch keeps its copy; reconnecting downloads and applies the update', async ({
    page,
    context,
    deployment,
    setOffline,
  }) => {
    await page.goto(`${deployment.origin}/pwa/settings`)

    await expect(ready(page)).toHaveCount(1)

    deployment.publish('release-b')

    const requests = deployment.workerRequests()

    await setOffline(true)

    await page.close()

    const reopened = await context.newPage()

    await reopened.goto(`${deployment.origin}/pwa/settings`)

    await expect(version(reopened, 'release-a')).toBeVisible()
    await expect(ready(reopened)).toHaveCount(1)
    await expect(
      reopened.getByText('Offline preparation could not finish.', { exact: true }),
    ).toHaveCount(0)
    expect(deployment.workerRequests()).toBe(requests)

    await setOffline(false)

    await foreground(reopened)

    await expect(version(reopened, 'release-b')).toBeVisible({ timeout: 20_000 })
  })

  test('a failed update leaves the complete old copy usable and retries on the next opening', async ({
    page,
    deployment,
    setOffline,
  }) => {
    await page.goto(`${deployment.origin}/pwa/settings`)

    await expect(ready(page)).toHaveCount(1)

    const failedUpdate = await page.evaluateHandle(async () => {
      const registration = await navigator.serviceWorker.getRegistration('/pwa/')

      if (registration === undefined) {
        throw new Error('The prepared PWA must have a service worker registration.')
      }

      const update = { worker: registration.installing }

      registration.addEventListener('updatefound', () => {
        update.worker = registration.installing
      })

      return update
    })

    deployment.failDownloads(true)

    deployment.publish('release-b')

    await foreground(page)

    await expect.poll(deployment.failedRequests).toBeGreaterThan(0)

    // A server-side 503 does not mean the browser has finished rejecting the
    // installation. Retain the worker: registration.installing is cleared when
    // it becomes redundant, and reconnecting earlier can join that failed job.
    await expect.poll(() => failedUpdate.evaluate(({ worker }) => worker?.state)).toBe('redundant')

    await failedUpdate.dispose()

    await expect(version(page, 'release-a')).toBeVisible()
    await expect(ready(page)).toHaveCount(1)

    await setOffline(true)

    await page.reload()

    await expect(version(page, 'release-a')).toBeVisible()
    await expect(ready(page)).toHaveCount(1)

    deployment.failDownloads(false)

    await setOffline(false)

    await foreground(page)

    await expect(version(page, 'release-b')).toBeVisible({ timeout: 20_000 })
    await expect(ready(page)).toHaveCount(1)
  })

  test('an active mock in another PWA window defers activation until it is exited', async ({
    page,
    context,
    deployment,
  }) => {
    await page.goto(`${deployment.origin}/pwa/settings`)

    await expect(ready(page)).toHaveCount(1)

    const exam = await context.newPage()

    await exam.goto(`${deployment.origin}/pwa/mock-test`)

    await exam.getByRole('button', { name: 'Start mock test', exact: true }).click()

    await expect(exam.getByRole('radio').first()).toBeVisible()

    await exam.getByRole('radio').first().click()

    deployment.publish('release-b')

    await foreground(page)

    await expect
      .poll(() =>
        page.evaluate(async () =>
          Boolean((await navigator.serviceWorker.getRegistration('/pwa/'))?.waiting),
        ),
      )
      .toBe(true)

    // Cross the handshake deadline and verify the selected answer is untouched.
    await page.waitForTimeout(3000)

    await expect(version(page, 'release-a')).toBeVisible()
    await expect(exam.getByRole('radio').first()).toBeChecked()

    await exam.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click()

    await exam.getByRole('button', { name: 'Exit test', exact: true }).click()

    await expect(version(exam, 'release-b')).toBeVisible({ timeout: 20_000 })
    await expect(version(page, 'release-b')).toBeVisible({ timeout: 20_000 })
  })
})

test('ordinary browser refresh delivers the new release without preparing offline storage', async ({
  page,
  context,
  deployment,
}) => {
  await page.goto(`${deployment.origin}/settings`)

  await expect(version(page, 'release-a')).toBeVisible()
  await expect(page.getByText('Offline readiness on this device', { exact: true })).toHaveCount(0)

  deployment.publish('release-b')

  await page.reload()

  await expect(version(page, 'release-b')).toBeVisible()
  expect(
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),
  ).toBe(0)
  expect(await page.evaluate(async () => await caches.keys())).toEqual([])

  // Installing on the same origin must not give ordinary browser routes a cache.
  const installed = await context.newPage()

  await installed.addInitScript(() =>
    Object.defineProperty(navigator, 'standalone', { value: true }),
  )

  await installed.goto(`${deployment.origin}/pwa/settings`)

  await expect(ready(installed)).toHaveCount(1)

  await page.reload()

  expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull()
})

test('a legacy root worker migrates on refresh without clearing learner progress', async ({
  page,
  deployment,
}) => {
  const question = sourceQuestion(1)

  await page.goto(`${deployment.origin}/study/${question.id}`)

  await studyAnswer(page, question.correct_option).click()

  await expect(studyAnswer(page, question.correct_option)).toContainText('Correct')

  deployment.serveLegacyWorker()

  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })

    await navigator.serviceWorker.ready
  })

  await page.goto(`${deployment.origin}/settings`)

  await expect(version(page, 'release-a')).toBeVisible()
  expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toBe(
    `${deployment.origin}/sw.js`,
  )

  deployment.publish('release-b')

  await page.reload()

  await expect(version(page, 'release-b')).toBeVisible({ timeout: 20_000 })

  // The legacy launch bridge remains for old installed start URLs, but HTML
  // comes from the network, including on later refreshes.
  await page.reload()

  await expect(version(page, 'release-b')).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

  await expect(page.getByText('Learning · 1', { exact: true })).toBeVisible()
})

test('an existing installed launch URL continues to open the PWA offline after migration', async ({
  page,
  context,
  deployment,
  setOffline,
}) => {
  await page.goto(`${deployment.origin}/settings`)

  deployment.serveLegacyWorker()

  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })

    await navigator.serviceWorker.ready
  })

  deployment.publish('release-b')

  await context.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }))

  await page.goto(`${deployment.origin}/dashboard`)

  await expect(page).toHaveURL(`${deployment.origin}/pwa/dashboard`)
  await expect(ready(page)).toHaveCount(1)

  // Confirm the new root launch bridge has replaced the legacy worker before
  // taking the network away. The installed app still uses its old start URL.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration('/')

        return new Promise((resolve) => {
          const channel = new MessageChannel()

          const timeout = setTimeout(() => {
            channel.port1.close()

            resolve(false)
          }, 500)

          channel.port1.onmessage = (event) => {
            clearTimeout(timeout)

            channel.port1.close()

            resolve(event.data === 'legacy-launch-bridge')
          }

          registration?.active?.postMessage('GET_VERSION', [channel.port2])
        })
      }),
    )
    .toBe(true)

  await setOffline(true)

  await page.goto(`${deployment.origin}/dashboard`)

  await expect(page).toHaveURL(`${deployment.origin}/pwa/dashboard`)
  await expect(ready(page)).toHaveCount(1)
})

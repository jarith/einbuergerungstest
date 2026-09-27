import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { studyAnswer } from './helpers'

const { Given, When, Then } = createBdd()

Then('the app manifest supports a standalone launch with icons', async ({ page }) => {
  const path = await page.locator('link[rel="manifest"]').getAttribute('href')

  if (path === null || path === '') {
    throw new Error('The page does not link to a web app manifest.')
  }

  const response = await page.request.get(new URL(path, page.url()).toString())

  expect(response.ok()).toBe(true)
  expect(await response.json()).toEqual(
    expect.objectContaining({
      name: expect.any(String),
      display: 'standalone',
      icons: expect.arrayContaining([expect.objectContaining({ src: expect.any(String) })]),
    }),
  )
})

When('I open installation guidance', async ({ page }) => {
  await page.getByRole('button', { name: 'App installieren' }).click()
})

Then('I see iPhone and iPad installation steps', async ({ page }) => {
  const guidance = page.getByRole('dialog', { name: 'App installieren' })

  await expect(guidance).toContainText('iPhone')
  await expect(guidance).toContainText('iPad')
  await expect(guidance).toContainText('Safari')
  await expect(guidance).toContainText('Home-Bildschirm')
})

When('the app has been prepared for offline use', async ({ page }) => {
  await expect
    .poll(() =>
      page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) {
          return false
        }

        const registration = await navigator.serviceWorker.getRegistration()

        return Boolean(registration?.active)
      }),
    )
    .toBe(true)

  await page.reload()

  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)
})

When('I disconnect the browser from the network', async ({ page }) => {
  await page.context().setOffline(true)
})

Given('the viewport is {int} by {int} pixels', async ({ page }, width: number, height: number) => {
  await page.setViewportSize({ width, height })
})

Then('the page has no horizontal overflow', async ({ page }) => {
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  )

  expect(fits).toBe(true)
})

Then('the study answer controls are usable by touch', async ({ page }) => {
  for (const label of ['A', 'B', 'C', 'D']) {
    const box = await studyAnswer(page, label).boundingBox()

    if (!box) {
      throw new Error(`Answer ${label} has no visible touch target.`)
    }

    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  }
})

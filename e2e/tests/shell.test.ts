import { expect, test } from '@playwright/test'

import { expectViewportFit } from './helpers'

test('desktop navigation sits beside the main content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })

  await page.goto('/dashboard')

  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  const main = page.getByRole('main')

  await expect(navigation).toBeVisible()
  await expect(main).toBeVisible()

  const navigationBounds = await navigation.boundingBox()
  const mainBounds = await main.boundingBox()

  if (navigationBounds === null || mainBounds === null) {
    throw new Error('Navigation and main content must be visible')
  }

  expect(navigationBounds.x + navigationBounds.width).toBeLessThanOrEqual(mainBounds.x)
  expect(mainBounds.y).toBe(0)
  await expect(navigation).toHaveCSS('flex-direction', 'column')
  await expect(main).toHaveCSS('padding-inline-start', '46px')
})

test('phone navigation stays fixed at the bottom without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto('/dashboard')

  const navigation = page.getByRole('navigation', { name: 'Main navigation' })

  await expect(navigation).toBeVisible()

  const navigationBounds = await navigation.boundingBox()

  if (navigationBounds === null) {
    throw new Error('Navigation must be visible')
  }

  expect(navigationBounds.y).toBeGreaterThanOrEqual(0)
  expect(navigationBounds.y + navigationBounds.height).toBeCloseTo(844, 0)
  await expect(navigation).toHaveCSS('position', 'fixed')

  await expectViewportFit(page)
})

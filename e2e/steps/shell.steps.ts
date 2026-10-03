import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

Given('the browser viewport is {int} by {int}', async ({ page }, width: number, height: number) => {
  await page.setViewportSize({ width, height })
})

Then('the navigation appears beside the main content', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  const main = page.getByRole('main')
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

Then('the navigation stays at the bottom of the viewport', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  const navigationBounds = await navigation.boundingBox()
  const viewport = page.viewportSize()

  if (navigationBounds === null || viewport === null) {
    throw new Error('Navigation and browser viewport must be available')
  }

  expect(navigationBounds.y).toBeGreaterThanOrEqual(0)
  expect(navigationBounds.y + navigationBounds.height).toBeCloseTo(viewport.height, 0)
  await expect(navigation).toHaveCSS('position', 'fixed')
})

Then('the application fits the viewport width', async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})

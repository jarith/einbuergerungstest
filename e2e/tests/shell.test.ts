import { expect, test } from '@playwright/test'

import { bounds, expectViewportFit } from './helpers'

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

  const firstLink = await bounds(navigation.getByRole('link').first())
  const lastLink = await bounds(navigation.getByRole('link').last())

  const linkBounds = await navigation.getByRole('link').evaluateAll((links) =>
    links.map((link) => {
      const { x, y, bottom } = link.getBoundingClientRect()

      return { x, y, bottom }
    }),
  )

  const heading = await bounds(main.getByRole('heading', { level: 1 }))

  expect(lastLink.y).toBeGreaterThanOrEqual(firstLink.y + firstLink.height)
  expect(new Set(linkBounds.map(({ x }) => x)).size).toBe(1)
  expect(
    linkBounds.slice(1).every((next, index) => next.y >= (linkBounds[index]?.bottom ?? Infinity)),
  ).toBe(true)
  expect(heading.x).toBeGreaterThan(mainBounds.x)
  expect(heading.x + heading.width).toBeLessThanOrEqual(mainBounds.x + mainBounds.width)
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

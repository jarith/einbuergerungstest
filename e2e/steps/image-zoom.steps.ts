import type { Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { sourceQuestion } from './helpers'

const { When, Then } = createBdd()

const bounds = (locator: Locator) =>
  locator.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect()

    return { x, y, width, height }
  })

When(
  'I view question {int} at {int} by {int}',
  async ({ page }, question: number, width: number, height: number) => {
    await page.setViewportSize({ width, height })

    await page.goto(`/study/${sourceQuestion(question).id}`)

    await expect(page.getByRole('img', { name: /Illustration for question/ })).toBeVisible()
  },
)

Then('the inline question image fits its desktop height limit', async ({ page }) => {
  const image = page.getByRole('img', { name: /Illustration for question/ })

  await expect(image).toHaveJSProperty('complete', true)

  const size = await bounds(image)
  const width = await page.evaluate(() => innerWidth)

  expect(size.height).toBeGreaterThan(0)

  if (width >= 1024) {
    expect(size.height).toBeLessThanOrEqual(400)
  }
})

When('I enlarge the question image', async ({ page }) => {
  await page.getByRole('button', { name: 'Enlarge question image', exact: true }).click()
})

Then('every zoom level keeps the image viewer and its controls in place', async ({ page }) => {
  const dialog = page.getByRole('dialog')
  const viewport = dialog.getByRole('region', { name: 'Enlarged question image' })
  const image = viewport.getByRole('img', { name: /Illustration for question/ })
  const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true })
  const zoomOut = dialog.getByRole('button', { name: 'Zoom out', exact: true })
  const level = dialog.getByRole('status')
  const screen = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))

  await expect(image).toHaveJSProperty('complete', true)

  const initialViewport = await bounds(viewport)
  const initialControl = await bounds(zoomIn)
  const fittedImage = await bounds(image)

  expect(fittedImage.width).toBeLessThanOrEqual(initialViewport.width + 1)
  expect(fittedImage.height).toBeLessThanOrEqual(initialViewport.height + 1)
  await expect(zoomOut).toBeDisabled()

  for (const zoom of [1, 2, 3]) {
    await expect(level).toHaveText(`${zoom * 100}%`)
    expect(await bounds(dialog)).toEqual({ x: 0, y: 0, ...screen })
    expect(await bounds(viewport)).toEqual(initialViewport)
    expect(await bounds(zoomIn)).toEqual(initialControl)

    const minus = await bounds(zoomOut)
    const output = await bounds(level)
    const plus = await bounds(zoomIn)

    expect(Math.abs(output.y + output.height / 2 - plus.y - plus.height / 2)).toBeLessThan(1)
    expect(
      Math.abs(output.x + output.width / 2 - (minus.x + minus.width + plus.x) / 2),
    ).toBeLessThan(1)
    expect(plus.y + plus.height).toBeLessThan(screen.height)

    const enlarged = await bounds(image)

    expect(enlarged.width).toBeCloseTo(fittedImage.width * zoom, 0)
    expect(enlarged.height).toBeCloseTo(fittedImage.height * zoom, 0)

    if (zoom < 3) {
      await zoomIn.click()
    }
  }

  await expect(zoomIn).toBeDisabled()

  await viewport.focus()

  await page.keyboard.press('ArrowDown')

  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)

  await zoomOut.click()

  await zoomOut.click()

  await expect(level).toHaveText('100%')
  await expect(zoomOut).toBeDisabled()
})

Then('I can close the image viewer and return to its trigger', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Enlarge question image', exact: true })

  await page.keyboard.press('Escape')

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(trigger).toBeFocused()

  await trigger.click()

  await expect(page.getByRole('dialog').getByRole('status')).toHaveText('100%')

  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).last().click()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

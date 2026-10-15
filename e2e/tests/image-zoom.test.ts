import { expect, test } from '@playwright/test'

import { sourceQuestion, studyAnswer } from '../support/browser'
import { bounds } from './helpers'

// Rendering geometry and keyboard interaction belong to the browser UI suite.
for (const { question, width, height } of [
  { question: 308, width: 1440, height: 900 },
  { question: 21, width: 1440, height: 900 },
  { question: 308, width: 390, height: 844 },
  { question: 308, width: 844, height: 390 },
]) {
  test(`question ${question} keeps zoom controls stable and resets on reopening at ${width} × ${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })

    await page.goto(`/study/${sourceQuestion(question).id}`)

    await expect(page.getByRole('img', { name: /Illustration for question/ })).toBeVisible()

    const image = page.getByRole('img', { name: /Illustration for question/ })

    await expect(image).toHaveJSProperty('complete', true)

    await studyAnswer(page, 'A').click()

    await expect(studyAnswer(page, 'A')).toBeChecked()

    const size = await bounds(image)

    expect(size.height).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Enlarge question image', exact: true }).click()

    const dialog = page.getByRole('dialog')
    const viewport = dialog.getByRole('region', { name: 'Enlarged question image' })
    const enlargedImage = viewport.getByRole('img', { name: /Illustration for question/ })
    const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true })
    const zoomOut = dialog.getByRole('button', { name: 'Zoom out', exact: true })
    const level = dialog.getByRole('status')
    const screen = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))

    await expect(enlargedImage).toHaveJSProperty('complete', true)

    const initialViewport = await bounds(viewport)
    const initialControl = await bounds(zoomIn)
    const fittedImage = await bounds(enlargedImage)

    expect(fittedImage.width).toBeLessThanOrEqual(initialViewport.width + 1)
    expect(fittedImage.height).toBeLessThanOrEqual(initialViewport.height + 1)
    await expect(zoomOut).toBeDisabled()

    const expectZoomLayout = async (zoom: number, expectedLabel: string) => {
      await expect(level).toHaveText(expectedLabel)
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

      const enlarged = await bounds(enlargedImage)

      expect(enlarged.width).toBeCloseTo(fittedImage.width * zoom, 0)
      expect(enlarged.height).toBeCloseTo(fittedImage.height * zoom, 0)
    }

    // Legacy characterization: the existing viewer starts at 100%, changes by 100%,
    // caps at 300%, and resets on reopening. These values are not new product requirements.
    await expectZoomLayout(1, '100%')

    await zoomIn.click()

    await expectZoomLayout(2, '200%')

    await zoomIn.click()

    await expectZoomLayout(3, '300%')

    await expect(zoomIn).toBeDisabled()

    await viewport.focus()

    await page.keyboard.press('ArrowDown')

    await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)

    await zoomOut.click()

    await zoomOut.click()

    await expect(level).toHaveText('100%')
    await expect(zoomOut).toBeDisabled()

    await zoomIn.click()

    await expect(level).toHaveText('200%')

    const trigger = page.getByRole('button', { name: 'Enlarge question image', exact: true })

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(trigger).toBeFocused()

    await trigger.click()

    await expect(page.getByRole('dialog').getByRole('status')).toHaveText('100%')

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Close', exact: true })
      .last()
      .click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await expect(
      page.getByRole('heading', { name: sourceQuestion(question).question_de, exact: true }),
    ).toBeVisible()

    await expect(studyAnswer(page, 'A')).toBeChecked()
    await expect(studyAnswer(page, 'A')).toBeDisabled()
  })
}

// Preserve the existing desktop image-size characterization separately from zoom behavior.
for (const question of [21, 308]) {
  test(`desktop illustration ${question} respects the existing height cap`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(`/study/${sourceQuestion(question).id}`)

    const image = page.getByRole('img', { name: /Illustration for question/ })

    await expect(image).toHaveJSProperty('complete', true)

    const size = await bounds(image)
    const expectedMaximumHeight = 400

    expect(size.height).toBeGreaterThan(0)
    expect(size.height).toBeLessThanOrEqual(expectedMaximumHeight)
  })
}

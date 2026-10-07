import { expect, test } from '@playwright/test'

import { sourceQuestion, studyAnswer } from '../support/browser'
import { expectViewportFit, waitForAppReady } from './helpers'

for (const width of [390, 1440]) {
  test(
    `study slides preserve focus and cancel on reversal at ${width}px`,
    { tag: '@webkit' },
    async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })

      await page.goto(`/study/${sourceQuestion(1).id}`)

      await waitForAppReady(page)

      for (const [button, order, sign] of [
        ['Next', 2, 1],
        ['Previous', 1, -1],
      ] as const) {
        // Pause the real browser animation so semantics and interruption can be checked mid-slide.
        const observation = page.evaluate(
          (questionKey) =>
            new Promise<number>((resolve) => {
              const inspect = () => {
                const container = document.querySelector(`[data-study-question="${questionKey}"]`)
                const content = container?.firstElementChild
                const animations = content?.getAnimations() ?? []

                if (content instanceof HTMLElement && animations.length > 0) {
                  const active = container?.getAnimations({ subtree: true }) ?? []

                  active.forEach((animation) => {
                    animation.pause()

                    animation.currentTime = 40
                  })

                  resolve(new DOMMatrix(getComputedStyle(content).transform).m41)
                } else {
                  requestAnimationFrame(inspect)
                }
              }

              requestAnimationFrame(inspect)
            }),
          sourceQuestion(order).id,
        )

        await page.getByRole('button', { name: button, exact: true }).click()

        expect((await observation) * sign).toBeGreaterThan(0)
        await expect(page.getByRole('radio')).toHaveCount(4)
        await expect(page.locator('[data-study-outgoing]')).toHaveAttribute('aria-hidden', 'true')
        await expect(page.locator('[data-study-outgoing]')).toHaveAttribute('inert', '')
        await expect(
          page.getByRole('heading', { name: sourceQuestion(order).question_de, exact: true }),
        ).toBeFocused()

        await expectViewportFit(page)
      }

      // Another navigation cancels the paused entrance instead of queuing it.
      await page.getByRole('button', { name: 'Next', exact: true }).click()

      await expect(
        page.getByRole('heading', { name: sourceQuestion(2).question_de, exact: true }),
      ).toBeFocused()
      await expect(page.locator('[data-study-outgoing]')).toHaveCount(0)

      await expect
        .poll(() =>
          page
            .locator('[data-study-question]')
            .evaluate((element) => element.getAnimations({ subtree: true }).length),
        )
        .toBe(0)

      await studyAnswer(page, 'A').click()

      await expect(studyAnswer(page, 'A')).toHaveAttribute('aria-checked', 'true')
    },
  )
}

test(
  'reduced motion keeps study navigation and translation immediate',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.goto(`/study/${sourceQuestion(1).id}`)

    await waitForAppReady(page)

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(
      page.getByRole('heading', { name: sourceQuestion(2).question_de, exact: true }),
    ).toBeFocused()
    await expect(page.locator('[data-study-outgoing]')).toHaveCount(0)
    expect(
      await page
        .locator('[data-study-question]')
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0)

    const translation = page.getByRole('button', { name: /translation/i })

    await translation.focus()

    await translation.press('Space')

    await expect(translation).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeVisible()
    await expect(translation).toBeFocused()
    expect(
      await page
        .locator('[data-study-question]')
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0)

    await translation.press('Space')

    await expect(translation).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeHidden()
    await expect(translation).toBeFocused()

    await expectViewportFit(page)
  },
)

test(
  'translation expands and collapses without replaying on the next question',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto(`/study/${sourceQuestion(1).id}`)

    await waitForAppReady(page)

    const translation = page.getByRole('button', { name: /translation/i })
    const english = page.getByText(sourceQuestion(1).question_en, { exact: true })

    await expect(english).toBeHidden()

    const expansion = page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          const observe = (event: TransitionEvent) => {
            if (event.propertyName === 'grid-template-rows') {
              document.removeEventListener('transitionrun', observe)

              resolve(event.propertyName)
            }
          }

          document.addEventListener('transitionrun', observe)
        }),
    )

    await translation.click()

    expect(await expansion).toBe('grid-template-rows')
    await expect(english).toBeVisible()
    await expect(translation).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeVisible()
    expect(
      await page
        .locator('[data-open]')
        .evaluateAll((elements) => elements.some((element) => element.getAnimations().length > 0)),
    ).toBe(false)

    await translation.click()

    await expect(translation).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeHidden()
  },
)

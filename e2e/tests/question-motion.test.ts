import { expect, test } from '@playwright/test'

import { mockAnswer, sourceQuestion, studyAnswer } from '../support/browser'
import { expectViewportFit, startMock, waitForAppReady } from './helpers'

for (const mode of ['study', 'mock'] as const) {
  for (const width of [390, 1440]) {
    test(
      `${mode} slides preserve focus and cancel on reversal at ${width}px`,
      { tag: '@webkit' },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 844 })

        await page.emulateMedia({ reducedMotion: 'no-preference' })

        if (mode === 'study') {
          await page.goto(`/study/${sourceQuestion(1).id}`)

          await waitForAppReady(page)
        } else {
          await page.goto('/dashboard')

          await startMock(page)
        }

        for (const [button, sign] of [
          ['Next', 1],
          ['Previous', -1],
        ] as const) {
          const previousKey = await page
            .locator('[data-question-slide]')
            .getAttribute('data-question-slide')

          // Observe the DOM commit before paint: a delayed animation-frame poll can miss the slide.
          // Pause the real browser animation so semantics and interruption can be checked mid-slide.
          const observation = page.evaluate(
            (questionKey) =>
              new Promise<number>((resolve) => {
                const inspect = () => {
                  const container = document.querySelector('[data-question-slide]')

                  if (container?.getAttribute('data-question-slide') === questionKey) {
                    return
                  }
                  const content = container?.firstElementChild
                  const animations = content?.getAnimations() ?? []

                  if (content instanceof HTMLElement && animations.length > 0) {
                    observer.disconnect()

                    const active = container?.getAnimations({ subtree: true }) ?? []

                    active.forEach((animation) => {
                      animation.pause()

                      animation.currentTime = 40
                    })

                    resolve(new DOMMatrix(getComputedStyle(content).transform).m41)
                  }
                }

                const observer = new MutationObserver(inspect)

                observer.observe(document.body, { childList: true, subtree: true })
              }),
            previousKey,
          )

          await page.getByRole('button', { name: button, exact: true }).click()

          expect((await observation) * sign).toBeGreaterThan(0)
          await expect(page.getByRole('radio')).toHaveCount(4)
          await expect(page.locator('[data-question-outgoing]')).toHaveAttribute(
            'aria-hidden',
            'true',
          )
          await expect(page.locator('[data-question-outgoing]')).toHaveAttribute('inert', '')
          await expect(page.locator('[data-question-slide] [data-question-heading]')).toBeFocused()

          await expectViewportFit(page)
        }

        // Another navigation cancels the paused entrance instead of queuing it.
        await page.getByRole('button', { name: 'Next', exact: true }).click()

        await expect(page.locator('[data-question-slide] [data-question-heading]')).toBeFocused()
        await expect(page.locator('[data-question-outgoing]')).toHaveCount(0)

        await expect
          .poll(() =>
            page
              .locator('[data-question-slide]')
              .evaluate((element) => element.getAnimations({ subtree: true }).length),
          )
          .toBe(0)

        await studyAnswer(page, 'A').click()

        await expect(studyAnswer(page, 'A')).toHaveAttribute('aria-checked', 'true')

        if (mode === 'mock') {
          await mockAnswer(page, 'B').click()

          await expect(mockAnswer(page, 'B')).toBeChecked()
          await expect(page.getByRole('button', { name: /translation/i })).toHaveCount(0)
          await expect(page.getByText('Correct', { exact: true })).toHaveCount(0)
          await expect(page.getByText('Mistaken', { exact: true })).toHaveCount(0)

          await page.getByRole('button', { name: 'Previous', exact: true }).click()

          await page.getByRole('button', { name: 'Next', exact: true }).click()

          await expect(mockAnswer(page, 'B')).toBeChecked()
        }
      },
    )
  }
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
    await expect(page.locator('[data-question-outgoing]')).toHaveCount(0)
    expect(
      await page
        .locator('[data-question-slide]')
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
        .locator('[data-question-slide]')
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
  'mock navigation respects reduced motion, picker dismissal, and paper boundaries',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.goto('/dashboard')

    await startMock(page)

    await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled()

    const firstKey = await page.locator('[data-question-slide]').getAttribute('data-question-slide')

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.locator('[data-question-slide]')).not.toHaveAttribute(
      'data-question-slide',
      firstKey ?? '',
    )
    await expect(page.locator('[data-question-slide] [data-question-heading]')).toBeFocused()
    await expect(page.locator('[data-question-outgoing]')).toHaveCount(0)
    expect(
      await page
        .locator('[data-question-slide]')
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0)

    const trigger = page.getByRole('button', { name: 'All 33 questions', exact: true })
    const picker = page.getByRole('dialog', { name: 'All 33 questions', exact: true })

    await trigger.click()

    await picker.getByRole('button', { name: /^Question 2 of 33\b/ }).click()

    await expect(picker).toHaveCount(0)

    await trigger.click()

    await picker.getByRole('button', { name: /^Question 33 of 33\b/ }).click()

    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Submit test', exact: true })).toBeEnabled()
  },
)

test(
  'shared navigation still finishes study and restarts with fresh session answers',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto(`/study/${sourceQuestion(310).id}?mode=sequential`)

    await waitForAppReady(page)

    await studyAnswer(page, 'A').click()

    await expect(studyAnswer(page, 'A')).toBeDisabled()

    await page.getByRole('button', { name: 'Finish study', exact: true }).click()

    await expect(
      page.getByText(
        'You reached the end of all 310 questions. You can start another pass or review your progress.',
        { exact: true },
      ),
    ).toBeVisible()
    await expect(page.getByRole('radio')).toHaveCount(0)

    await page.getByRole('button', { name: 'Practise again', exact: true }).click()

    await expect(
      page.getByRole('heading', { name: sourceQuestion(1).question_de, exact: true }),
    ).toBeVisible()
    await expect(studyAnswer(page, 'A')).toBeEnabled()
    await expect(studyAnswer(page, 'A')).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled()
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

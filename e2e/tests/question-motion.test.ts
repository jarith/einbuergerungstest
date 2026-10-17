import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import questionBank from '../../web/public/questionbank-berlin.json' with { type: 'json' }
import { mockAnswer, sourceQuestion, studyAnswer } from '../support/browser'
import { expectViewportFit, startMock, waitForAppReady } from './helpers'

// Observe before the action: a completed short animation must still count as having started.
// Mutation callbacks catch Web Animations created during a DOM commit; native events catch
// CSS transitions/animations even when they finish before the next runner assertion.
const observeAnimations = async (page: Page, selector: string, pause = false) =>
  await page.evaluateHandle(
    ({ selector: scope, pause: shouldPause }) => {
      const animations = () =>
        [...document.querySelectorAll(scope)].flatMap((element) =>
          element.getAnimations({ subtree: true }),
        )

      const existing = new Set(animations())
      const started = new Set<Animation>()
      const events: string[] = []

      const inspect = () => {
        animations().forEach((animation) => {
          if (existing.has(animation) || started.has(animation)) {
            return
          }

          started.add(animation)

          if (shouldPause) {
            animation.pause()

            animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2
          }
        })
      }

      const onStart = (event: Event) => {
        if (event.target instanceof Element && event.target.closest(scope) !== null) {
          events.push(event.type)

          inspect()
        }
      }

      const observer = new MutationObserver(inspect)

      observer.observe(document.body, { childList: true, subtree: true, attributes: true })

      document.addEventListener('transitionrun', onStart)

      document.addEventListener('animationstart', onStart)

      const frame = { id: 0 }

      const sample = () => {
        inspect()

        frame.id = requestAnimationFrame(sample)
      }

      frame.id = requestAnimationFrame(sample)

      return {
        started,
        stop: async () => {
          // Flush style changes and native start events at rendering boundaries, not a timed sleep.
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          )

          inspect()

          observer.disconnect()

          cancelAnimationFrame(frame.id)

          document.removeEventListener('transitionrun', onStart)

          document.removeEventListener('animationstart', onStart)

          return { animations: started.size, events }
        },
      }
    },
    { selector, pause },
  )

const expectSlideNavigation = async (page: Page, button: 'Next' | 'Previous', sign: 1 | -1) => {
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
  await expect(page.locator('[data-question-outgoing]')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('[data-question-outgoing]')).toHaveAttribute('inert', '')
  await expect(page.locator('[data-question-slide] [data-question-heading]')).toBeFocused()

  await expectViewportFit(page)
}

for (const mode of ['study', 'mock'] as const) {
  for (const width of [390, 1440]) {
    test(
      `${mode} slides preserve focus and cancel on reversal at ${width}px`,
      { tag: '@webkit' },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 844 })

        await page.emulateMedia({ reducedMotion: 'no-preference' })

        // testing-ignore: Parameterized setup selects the real route; every motion assertion runs in both modes.
        if (mode === 'study') {
          await page.goto(`/study/${sourceQuestion(1).id}`)

          await waitForAppReady(page)
        } else {
          await page.goto('/dashboard')

          await startMock(page)
        }

        await expectSlideNavigation(page, 'Next', 1)

        await expectSlideNavigation(page, 'Previous', -1)

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
      },
    )
  }
}

test(
  'live mock answers remain editable without revealing correctness',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.goto('/dashboard')

    await startMock(page)

    const questionKey = new URL(page.url()).pathname.split('/').at(-1)
    const question = questionBank.questions.find((item) => item.id === questionKey)

    const wrongOption = question?.answer_options.find(
      (option) => option.label !== question.correct_option,
    )

    if (question === undefined || wrongOption === undefined) {
      throw new Error('The live mock question must have a known correct and incorrect answer.')
    }

    await mockAnswer(page, question.correct_option).click()

    await expect(mockAnswer(page, question.correct_option)).toBeChecked()
    await expect(page.getByText('Correct', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Incorrect', { exact: true })).toHaveCount(0)

    await mockAnswer(page, wrongOption.label).click()

    await expect(mockAnswer(page, wrongOption.label)).toBeChecked()
    await expect(mockAnswer(page, question.correct_option)).not.toBeChecked()
    await expect(page.getByRole('button', { name: /translation/i })).toHaveCount(0)
    await expect(page.getByText('Correct', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Incorrect', { exact: true })).toHaveCount(0)

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await page.getByRole('button', { name: 'Previous', exact: true }).click()

    await expect(mockAnswer(page, wrongOption.label)).toBeChecked()
  },
)

test(
  'reduced motion keeps study navigation and translation immediate',
  { tag: '@webkit' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.goto(`/study/${sourceQuestion(1).id}`)

    await waitForAppReady(page)

    const navigationMotion = await observeAnimations(page, '[data-question-slide]')

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(
      page.getByRole('heading', { name: sourceQuestion(2).question_de, exact: true }),
    ).toBeFocused()
    await expect(page.locator('[data-question-outgoing]')).toHaveCount(0)
    expect(await navigationMotion.evaluate((observation) => observation.stop())).toEqual({
      animations: 0,
      events: [],
    })

    const translation = page.getByRole('button', { name: /translation/i })

    await translation.focus()

    const translationMotion = await observeAnimations(page, '[data-open]')

    await translation.press('Space')

    await expect(translation).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeVisible()
    await expect(translation).toBeFocused()

    await translation.press('Space')

    await expect(translation).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeHidden()
    await expect(translation).toBeFocused()
    expect(await translationMotion.evaluate((observation) => observation.stop())).toEqual({
      animations: 0,
      events: [],
    })

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
    const navigationMotion = await observeAnimations(page, '[data-question-slide]')

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.locator('[data-question-slide]')).not.toHaveAttribute(
      'data-question-slide',
      firstKey ?? '',
    )
    await expect(page.locator('[data-question-slide] [data-question-heading]')).toBeFocused()
    await expect(page.locator('[data-question-outgoing]')).toHaveCount(0)
    expect(await navigationMotion.evaluate((observation) => observation.stop())).toEqual({
      animations: 0,
      events: [],
    })

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

    // Browser Back visits the answered final question inside the restarted session.
    // A document reload or a fresh Study entry would clear answers independently.
    await page.goBack()

    await expect(
      page.getByRole('heading', { name: sourceQuestion(310).question_de, exact: true }),
    ).toBeVisible()
    await expect(studyAnswer(page, 'A')).toBeEnabled()
    await expect(studyAnswer(page, 'A')).not.toBeChecked()
    await expect(page.getByText('Correct', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Incorrect', { exact: true })).toHaveCount(0)
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

    const reveal = page.locator('[data-open]').filter({ has: english })
    const expansion = await observeAnimations(page, '[data-open]', true)

    await translation.click()

    await expect
      .poll(() => expansion.evaluate((observation) => observation.started.size))
      .toBeGreaterThan(0)

    await expect(english).toBeVisible()
    await expect(translation).toHaveAttribute('aria-pressed', 'true')

    const expandedHeight = await english.evaluate(
      (element) => element.getBoundingClientRect().height,
    )

    const intermediateHeight = await reveal.evaluate(
      (element) => element.getBoundingClientRect().height,
    )

    expect(intermediateHeight).toBeGreaterThan(0)
    expect(intermediateHeight).toBeLessThan(expandedHeight)

    await expansion.evaluate((observation) => observation.stop())

    const collapse = await observeAnimations(page, '[data-open]', true)

    // Reverse while the native expansion is paused halfway, before it can finish.
    await translation.click()

    await expect(translation).toHaveAttribute('aria-pressed', 'false')

    await expect
      .poll(() => collapse.evaluate((observation) => observation.started.size))
      .toBeGreaterThan(0)

    const closingHeight = await reveal.evaluate((element) => element.getBoundingClientRect().height)

    expect(closingHeight).toBeGreaterThan(0)
    expect(closingHeight).toBeLessThan(intermediateHeight)

    await collapse.evaluate(async (observation) => {
      await observation.stop()

      observation.started.forEach((animation) => animation.play())
    })

    await expect(english).toBeHidden()

    await expect
      .poll(() => reveal.evaluate((element) => element.getBoundingClientRect().height))
      .toBe(0)

    await translation.click()

    await expect(english).toBeVisible()

    await expect
      .poll(() => reveal.evaluate((element) => element.getAnimations({ subtree: true }).length))
      .toBe(0)

    const arrival = await observeAnimations(page, '[data-open]')

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeVisible()
    expect(await arrival.evaluate((observation) => observation.stop())).toEqual({
      animations: 0,
      events: [],
    })

    await translation.click()

    await expect(translation).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText(sourceQuestion(2).question_en, { exact: true })).toBeHidden()
  },
)

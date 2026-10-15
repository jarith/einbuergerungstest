import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'
import { startMock, waitForAppReady } from './helpers'

for (const mode of ['study', 'mock'] as const) {
  test(
    `${mode} navigation leaves surrounding controls unchanged`,
    { tag: '@webkit' },
    async ({ page }) => {
      // testing-ignore: Only route setup varies; the stability assertions run for every mode.
      if (mode === 'mock') {
        await page.goto('/dashboard')

        await startMock(page)
      } else {
        await page.goto(`/study/${sourceQuestion(1).id}?mode=sequential`)

        await waitForAppReady(page)
      }

      await expect(page.locator(mode === 'mock' ? 'main aside' : 'main details')).toBeVisible()

      const shell = await page.evaluateHandle((kind) => {
        const elements = [
          ...document.querySelectorAll(
            kind === 'mock' ? 'main aside' : 'main details, main output, main svg[role="img"]',
          ),
        ]

        const changes: string[] = []

        const observer = new MutationObserver((records) => {
          records.forEach((record) => changes.push(`${record.type}:${record.attributeName ?? ''}`))
        })

        // testing-ignore: Observe every DOM region; this loop contains no assertion.
        elements.forEach((element) =>
          observer.observe(element, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
          }),
        )

        return { elements, changes, observer }
      }, mode)

      const navigate = async (button: 'Next' | 'Previous') => {
        const previous = await page
          .locator('[data-question-slide]')
          .getAttribute('data-question-slide')

        await page.getByRole('button', { name: button, exact: true }).click()

        await expect(page.locator('[data-question-slide]')).not.toHaveAttribute(
          'data-question-slide',
          previous ?? '',
        )
        await expect(page.locator('[data-question-slide] [data-question-heading]')).toBeFocused()
      }

      await navigate('Next')

      await navigate('Next')

      await navigate('Previous')

      const result = await shell.evaluate(({ elements, changes, observer }) => {
        observer.disconnect()

        return {
          count: elements.length,
          connected: elements.every((element) => element.isConnected),
          changes,
        }
      })

      // These are the summary, or study help/save/progress regions named in CONTEXT.md.
      // Their retained DOM and lack of mutations intentionally guard render isolation.
      expect(result.count).toBe(mode === 'mock' ? 1 : 3)
      expect(result.connected).toBe(true)
      expect(result.changes).toEqual([])
    },
  )
}

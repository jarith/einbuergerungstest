import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'
import { bounds, expectViewportFit } from './helpers'

for (const width of [1023, 1024, 1440]) {
  for (const screen of ['study', 'mock', 'settings']) {
    test(`${screen} content follows the desktop breakpoint at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })

      await page.goto(
        screen === 'study'
          ? `/study/${sourceQuestion(1).id}`
          : screen === 'mock'
            ? '/mock-test'
            : '/settings',
      )

      if (screen === 'mock') {
        await page.getByRole('button', { name: 'Start mock test', exact: true }).click()

        await expect(page.getByRole('timer')).toBeVisible()
      }

      const content =
        screen === 'settings'
          ? page.getByRole('region', { name: 'Backup', exact: true })
          : page.getByRole('radiogroup').filter({ has: page.getByRole('radio') })

      const heading =
        screen === 'study'
          ? page.getByRole('heading', { name: sourceQuestion(1).question_de, exact: true })
          : page.getByRole('heading', {
              name: screen === 'mock' ? /^Mock test \/ Question 1 of 33$/ : 'Settings & backup',
              exact: true,
            })

      const contentBounds = await bounds(content)
      const headingBounds = await bounds(heading)
      const main = await bounds(page.getByRole('main'))

      expect(Math.abs(headingBounds.x - contentBounds.x)).toBeLessThanOrEqual(1)

      if (width >= 1024) {
        expect(Math.abs(contentBounds.width - width / 2)).toBeLessThanOrEqual(1)
        expect(
          Math.abs(contentBounds.x + contentBounds.width / 2 - (main.x + main.width / 2)),
        ).toBeLessThanOrEqual(1)
      } else {
        expect(contentBounds.width).toBeGreaterThan(width / 2)
      }

      if (screen === 'mock') {
        const next = await bounds(page.getByRole('button', { name: 'Next', exact: true }))
        const summary = await bounds(page.getByRole('complementary'))

        expect(summary.y).toBeGreaterThanOrEqual(next.y + next.height)
      }

      await expectViewportFit(page)
    })
  }
}

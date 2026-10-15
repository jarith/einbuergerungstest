import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'
import { bounds, expectViewportFit } from './helpers'

const openScreen = async (page: Page, screen: 'study' | 'mock' | 'settings', width: number) => {
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

  return {
    content: await bounds(content),
    heading: await bounds(heading),
    main: await bounds(page.getByRole('main')),
  }
}

for (const screen of ['study', 'mock', 'settings'] as const) {
  for (const width of [1024, 1440]) {
    test(`${screen} desktop content is half the viewport and centered at ${width}px`, async ({
      page,
    }) => {
      const { content, heading, main } = await openScreen(page, screen, width)
      const expectedContentWidth = width / 2

      expect(Math.abs(heading.x - content.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(content.width - expectedContentWidth)).toBeLessThanOrEqual(1)
      expect(
        Math.abs(content.x + content.width / 2 - (main.x + main.width / 2)),
      ).toBeLessThanOrEqual(1)

      await expectViewportFit(page)
    })
  }

  test(`${screen} retains its wider tablet content below the desktop breakpoint`, async ({
    page,
  }) => {
    const tabletWidth = 1023
    const { content, heading } = await openScreen(page, screen, tabletWidth)

    expect(Math.abs(heading.x - content.x)).toBeLessThanOrEqual(1)
    expect(content.width).toBeGreaterThan(tabletWidth / 2)

    await expectViewportFit(page)
  })
}

// testing-ignore: Each width declares an independent named test; no assertion repeats inside a test.
for (const width of [1023, 1024, 1440]) {
  test(`the live mock summary stacks below question navigation at ${width}px`, async ({ page }) => {
    await openScreen(page, 'mock', width)

    const next = await bounds(page.getByRole('button', { name: 'Next', exact: true }))
    const summary = await bounds(page.getByRole('complementary'))

    await expect(page.getByRole('timer')).toBeVisible()
    expect(summary.y).toBeGreaterThanOrEqual(next.y + next.height)
  })
}

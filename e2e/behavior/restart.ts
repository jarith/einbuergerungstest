import type { Page } from '@playwright/test'

export const restartLearner = async (page: Page) => {
  const studyPath = await page.evaluate(() =>
    window.behavior.state.study ? `${location.pathname}${location.search}` : null,
  )

  // A new document disposes the route graph and session state while retaining
  // this browser context's IndexedDB and controlled clock.
  await page.goto('/e2e/behavior/')

  await page.waitForFunction(() => Boolean(window.behavior))

  await page.evaluate((path) => window.behavior.reopen(path), studyPath)
}

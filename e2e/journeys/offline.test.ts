import { expect, test } from '@playwright/test'

import { sourceQuestion } from '../support/browser'

test(
  'a prepared copy studies an unseen illustrated question offline and saves the answer',
  { tag: '@smoke' },
  async ({ page, context }) => {
    // E2E criterion: real browser service-worker, deployment, and offline network boundary.
    await page.goto('/')

    await expect(
      page
        .getByRole('contentinfo', { includeHidden: true })
        .getByText('Ready offline', { exact: true }),
    ).toHaveCount(1)

    await page.reload()

    await expect
      .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
      .toBe(true)

    await context.setOffline(true)

    const question = sourceQuestion(21)

    await page.goto(`/study/${question.id}`)

    const illustration = page.getByRole('img', {
      name: 'Illustration for question 21',
      exact: true,
    })

    await expect(illustration).toBeVisible()

    await expect
      .poll(() =>
        illustration.evaluate(
          (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true)

    await page.getByRole('radio', { name: new RegExp(`^${question.correct_option}\\b`) }).click()

    await expect(page.getByRole('note').filter({ hasText: 'Correct' })).toBeVisible()

    await page.reload()

    await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

    await expect(page.getByText('Learning · 1', { exact: true })).toBeVisible()
  },
)

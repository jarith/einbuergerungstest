import { expect, test } from '@playwright/test'

import { mockAnswer, openNavigation } from '../support/browser'
import { startMock } from './helpers'

test(
  'browser history survives cancelling and confirming departure from a mock',
  { tag: '@webkit' },
  async ({ page }) => {
    // Browser boundary: a cancelled popstate must restore the active route without replacing history.
    await page.goto('/settings')

    await openNavigation(page, '/')

    await startMock(page)

    await mockAnswer(page, 'A').click()

    await expect(mockAnswer(page, 'A')).toBeChecked()

    const activeUrl = page.url()
    const exit = page.getByRole('dialog', { name: 'Leave this test?' })

    // The introduction entry redirects to the active question without leaving the paper.
    await page.goBack()

    await expect(page).toHaveURL(activeUrl)
    await expect(exit).toHaveCount(0)

    await page.goBack()

    await expect(exit).toBeVisible()
    await expect(page).toHaveURL(activeUrl)

    await exit.getByRole('button', { name: 'Stay in test', exact: true }).click()

    await expect(exit).toHaveCount(0)
    await expect(page).toHaveURL(activeUrl)
    await expect(mockAnswer(page, 'A')).toBeChecked()

    await page.goBack()

    await expect(exit).toBeVisible()

    await exit.getByRole('button', { name: 'Exit test', exact: true }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: 'Study all questions', exact: true })).toBeVisible()

    await page.goBack()

    await expect(page).toHaveURL('/settings')
    await expect(page.getByLabel('Planned test date', { exact: true })).toBeVisible()

    await page.goForward()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: 'Study all questions', exact: true })).toBeVisible()
    await expect(exit).toHaveCount(0)
  },
)

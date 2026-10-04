import { expect, test } from '@playwright/test'

import { mockAnswer } from '../support/browser'
import { startMock, tabTo } from './helpers'

for (const mode of ['live', 'review']) {
  test(
    `${mode} question picker supports keyboard jumps and dismissal`,
    { tag: '@webkit' },
    async ({ page }) => {
      await page.goto('/dashboard')

      await startMock(page)

      await mockAnswer(page, 'A').click()

      await expect(mockAnswer(page, 'A')).toBeChecked()

      if (mode === 'review') {
        await page.getByRole('button', { name: 'Submit test', exact: true }).click()

        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'Submit test', exact: true })
          .click()

        await expect(page).toHaveURL(/\/progress\/tests\//)
      }

      const trigger = page.getByRole('button', { name: 'All 33 questions', exact: true })
      const picker = page.getByRole('dialog', { name: 'All 33 questions', exact: true })
      const first = picker.getByRole('button', { name: /^Question 1 of 33\b/ })
      const eighth = picker.getByRole('button', { name: /^Question 8 of 33\b/ })

      await trigger.focus()

      await trigger.press('Enter')

      await expect(picker).toBeVisible()
      await expect(first).toHaveAttribute('aria-current', 'step')

      await tabTo(page, eighth)

      await page.keyboard.press('Enter')

      await expect(picker).toHaveCount(0)
      await expect(page.getByText(/(?:Question 8 of 33|QUESTION 8 OF 33)$/)).toBeVisible()

      await trigger.focus()

      await trigger.press('Enter')

      await expect(eighth).toHaveAttribute('aria-current', 'step')
      await expect(first).not.toHaveAttribute('aria-current', 'step')

      await page.keyboard.press('Escape')

      await expect(picker).toHaveCount(0)
      await expect(trigger).toBeFocused()
    },
  )
}

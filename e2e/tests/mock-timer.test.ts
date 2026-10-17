import { expect, test } from '@playwright/test'

import { startMock } from './helpers'

test('the mock timer displays zero-padded minutes and seconds', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-26T11:59:00Z') })

  await page.clock.pauseAt(new Date('2026-09-26T12:00:00Z'))

  await page.goto('/dashboard')

  await startMock(page)

  const timer = page.getByRole('timer', { name: 'Time remaining' })

  await expect(timer).toHaveText('60:00')

  await page.clock.fastForward(51 * 60_000 + 55_000)

  await expect(timer).toHaveText('08:05')
})

import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { backupWithProblem } from '../fixtures/backup'
import { restartLearner } from '../restart'

const { When, Then } = createBdd()

When('I select a backup larger than 10 MiB', async ({ page }) => {
  const read = await page.evaluate(async () => {
    const file = new File([' '.repeat(10 * 1024 * 1024 + 1)], 'oversized.json')
    const access = { read: false }

    // Instrument the browser file boundary to verify rejection before allocating file text.
    file.text = async () => {
      access.read = true

      return ''
    }

    await window.behavior.backup().selectFile(file)

    return access.read
  })

  expect(read).toBe(false)
})

Then('the oversized backup is rejected without reading it', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.backup().message())).toBe('too-large')
  expect(await page.evaluate(() => window.behavior.resources().learner.confirmation())).toBeNull()
})

When('I preview a backup with {string}', async ({ page }, problem: string) => {
  // Keep the one-millisecond rejection boundary fixed while the fixture crosses processes.
  await page.clock.setFixedTime(new Date(await page.evaluate(() => Date.now())))

  const snapshot = await page.evaluate(() => window.behavior.resources().learner())

  if (snapshot === null) {
    throw new Error('Start a learner before preparing an import.')
  }
  const now = await page.evaluate(() => Date.now())
  const source = backupWithProblem(snapshot, problem, now)

  // The public import boundary must also reject callers that bypass browser file selection.
  await expect(
    page.evaluate((backup) => window.behavior.resources().learner.previewImport(backup), source),
  ).rejects.toThrow(/Backup (exceeds|contains)/)
})

Then('the unsafe backup has no replacement preview', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.resources().learner.confirmation())).toBeNull()
})

Then('the oversized text is rejected by its encoded size', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.resources().learner.error()?.message)).toContain(
    'Backup exceeds 10 MiB',
  )
})

Then('my saved history is unchanged after restarting', async ({ page }) => {
  const expected = await page.evaluate(() => window.behavior.state.exported)

  expect(await page.evaluate(() => window.behavior.resources().learner.exportBackup())).toBe(
    expected,
  )

  await restartLearner(page)

  expect(await page.evaluate(() => window.behavior.resources().learner.exportBackup())).toBe(
    expected,
  )
})

When('I preview a backup at the supported size and identifier limits', async ({ page }) => {
  await page.evaluate(async () => {
    const snapshot = window.behavior.resources().learner()
    const attempt = snapshot?.studyAttempts[0]

    if (snapshot === null || attempt === undefined) {
      throw new Error('Record an answer before importing.')
    }

    const source = JSON.stringify({
      ...snapshot,
      studyAttempts: [{ ...attempt, id: 'a'.repeat(64) }],
    })

    await window.behavior
      .backup()
      .selectFile(new File([source.padEnd(10 * 1024 * 1024, ' ')], 'supported.json'))
  })
})

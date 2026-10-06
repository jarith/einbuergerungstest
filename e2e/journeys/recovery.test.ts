import { expect, test } from '@playwright/test'

import { readFile } from 'node:fs/promises'

import { studyAnswer } from '../support/browser'
import { seedProfile } from './fixtures'

test('recovery preserves a downloadable original before a confirmed fresh start', async ({
  page,
}) => {
  // E2E criterion: irreversible replacement of unreadable data; recovery file crosses the download boundary.
  const rejected = '{"version":1,"marker":"original learner data"}'

  await seedProfile(page, rejected)

  const pending = page.waitForEvent('download')

  await page.getByRole('button', { name: 'Download saved data', exact: true }).click()

  const download = await pending
  const path = await download.path()

  if (!path) {
    throw new Error('Recovery did not produce a file.')
  }
  expect(await readFile(path, 'utf8')).toBe(rejected)

  await page.getByRole('button', { name: 'Start with a fresh profile', exact: true }).click()

  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Reset saved data', exact: true })
    .click()

  await page.getByRole('link', { name: 'Study all questions', exact: true }).click()

  const answer = studyAnswer(page, 'D')

  await answer.click()

  await expect(answer).toBeChecked()
  await expect(answer).toContainText('Correct')

  await page.reload()

  await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

  await expect(page.getByText('Learning · 1', { exact: true })).toBeVisible()
})

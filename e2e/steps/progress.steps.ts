import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { questionStatusLabel, questionRow, openNavigation, openBackup } from './helpers'

const { When, Then } = createBdd()

const exportedBackups = new WeakMap<Page, string>()

Then('question {int} has status {string}', async ({ page }, number: number, status: string) => {
  const row = await questionRow(page, number)

  await expect(row).toContainText(new RegExp(questionStatusLabel(status)))

  await openNavigation(page, '/progress')
})

Then(
  'the question totals are {int} not started, {int} needing review, {int} learning, and {int} learned',
  async ({ page }, notStarted: number, needsReview: number, learning: number, learned: number) => {
    const progress = page.getByRole('main')

    await expect(progress).toContainText(
      new RegExp(`${notStarted}\\s+${questionStatusLabel('not-started')}`, 'i'),
      { useInnerText: true },
    )
    await expect(progress).toContainText(
      new RegExp(`${needsReview}\\s+${questionStatusLabel('needs-review')}`, 'i'),
      { useInnerText: true },
    )
    await expect(progress).toContainText(
      new RegExp(`${learning}\\s+${questionStatusLabel('learning')}`, 'i'),
      { useInnerText: true },
    )
    await expect(progress).toContainText(
      new RegExp(`${learned}\\s+${questionStatusLabel('learned')}`, 'i'),
      { useInnerText: true },
    )
  },
)

Then(
  'question {int} has {int} recorded attempt(s)',
  async ({ page }, number: number, count: number) => {
    const noun = count === 1 ? '(?:attempt|Versuch)' : '(?:attempts|Versuche)'
    const row = await questionRow(page, number)

    await expect(row).toContainText(new RegExp(`${count} ${noun}`))

    await openNavigation(page, '/progress')
  },
)

Then(
  'the mock totals are {int} completed, {int} passed, {int} failed, and {int} unfinished',
  async ({ page }, completed: number, passed: number, failed: number, unfinished: number) => {
    const history = page.getByRole('region', { name: /^(Mock tests|Probetests)$/ })

    await expect(history).toContainText(
      new RegExp(`${completed}\\s+(?:completed|abgeschlossen)`, 'i'),
    )
    await expect(history).toContainText(
      new RegExp(`(?:^|·)\\s*${passed}\\s+(?:passed|bestanden)`, 'i'),
    )
    await expect(history).toContainText(new RegExp(`${failed}\\s+(?:failed|nicht bestanden)`, 'i'))
    await expect(history).toContainText(
      new RegExp(`${unfinished}\\s+(?:unfinished|unvollständig)`, 'i'),
    )
  },
)

When('I export my progress', async ({ page }) => {
  await openBackup(page)

  const downloadPromise = page.waitForEvent('download')

  await page.getByRole('button', { name: /^(Export backup|Sicherung exportieren)$/ }).click()

  const download = await downloadPromise
  const path = await download.path()

  if (!path) {
    throw new Error('The progress export did not produce a local file.')
  }

  exportedBackups.set(page, path)
})

When('I import the exported progress', async ({ page }) => {
  const path = exportedBackups.get(page)

  if (path === undefined || path === '') {
    throw new Error('No exported backup is available in this scenario.')
  }

  await openBackup(page)

  await page.locator('input[type=file]').setInputFiles(path)
})

Then('the import preview describes 1 study attempt', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: /^(Backup preview|Backup-Vorschau)$/ }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('row', { name: /^(Study attempts|Lernversuche)/ })
      .getByRole('cell')
      .first(),
  ).toHaveText('1')
})

Then('the import preview describes 1 completed mock test', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: /^(Backup preview|Backup-Vorschau)$/ }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('row', { name: /^(Completed tests|Abgeschlossene Tests)/ })
      .getByRole('cell')
      .first(),
  ).toHaveText('1')
})

When('I confirm replacing local progress', async ({ page }) => {
  await page.getByRole('button', { name: /^(Import backup|Sicherung importieren)$/ }).click()

  await page
    .getByRole('dialog', { name: /^(Replace local data|Lokale Daten ersetzen)/ })
    .getByRole('button', { name: /^(Import backup|Sicherung importieren)$/ })
    .click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
})

When('I import an invalid progress file', async ({ page }) => {
  await openBackup(page)

  await page.locator('input[type=file]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('this is not a backup'),
  })
})

Then('I see a backup validation error', async ({ page }) => {
  await expect(page.getByRole('note').filter({ hasText: /invalid|ungültig/ })).toBeVisible()
})

When('I try to reset progress', async ({ page }) => {
  await openBackup(page)

  await page
    .getByRole('button', { name: /^(Reset local progress|Lokalen Fortschritt zurücksetzen)$/ })
    .click()
})

Then('I see a reset confirmation', async ({ page }) => {
  await expect(
    page.getByRole('dialog', { name: /^(Reset local progress|Lokalen Fortschritt zurücksetzen)/ }),
  ).toBeVisible()
})

When('I cancel the reset', async ({ page }) => {
  await page
    .getByRole('dialog', { name: /^(Reset local progress|Lokalen Fortschritt zurücksetzen)/ })
    .getByRole('button', { name: /^(Cancel|Abbrechen)$/ })
    .click()
})

When('I reset progress after confirmation', async ({ page }) => {
  await openBackup(page)

  await page
    .getByRole('button', { name: /^(Reset local progress|Lokalen Fortschritt zurücksetzen)$/ })
    .click()

  await page
    .getByRole('dialog', { name: /^(Reset local progress|Lokalen Fortschritt zurücksetzen)/ })
    .getByRole('button', { name: /^(Reset local progress|Lokalen Fortschritt zurücksetzen)$/ })
    .click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
})

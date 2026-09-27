import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const exportedBackups = new WeakMap<Page, string>()

const statusLabel = (status: string) => {
  if (status === 'correct') {
    return '(?:Correct|Richtig)'
  }

  if (status === 'mistaken') {
    return '(?:Incorrect|Wrong|Falsch)'
  }

  if (status === 'untried') {
    return '(?:Untried|Ungeübt)'
  }

  throw new Error(`Unknown question status: ${status}`)
}

Then('question {int} has status {string}', async ({ page }, number: number, status: string) => {
  await expect(
    page.getByRole('button', {
      name: new RegExp(`(?:Question|Frage) ${number}.*${statusLabel(status)}`),
    }),
  ).toBeVisible()
})

Then(
  'the question totals are {int} correct, {int} mistaken, and {int} untried',
  async ({ page }, correct: number, mistaken: number, untried: number) => {
    const progress = page.getByRole('region', { name: /^(Question progress|Fragenfortschritt)$/ })

    await expect(progress).toContainText(new RegExp(`${correct}\\s+(?:correct|richtig)`, 'i'))
    await expect(progress).toContainText(
      new RegExp(`${mistaken}\\s+(?:incorrect|wrong|falsch)`, 'i'),
    )
    await expect(progress).toContainText(new RegExp(`${untried}\\s+(?:untried|ungeübt)`, 'i'))
  },
)

Then(
  'question {int} has {int} recorded attempt(s)',
  async ({ page }, number: number, count: number) => {
    const noun = count === 1 ? '(?:attempt|Versuch)' : '(?:attempts|Versuche)'

    await expect(
      page.getByRole('button', {
        name: new RegExp(`(?:Question|Frage) ${number}.*${count} ${noun}`),
      }),
    ).toBeVisible()
  },
)

Then(
  'the mock totals are {int} completed, {int} passed, {int} failed, and {int} unfinished',
  async ({ page }, completed: number, passed: number, failed: number, unfinished: number) => {
    const history = page.getByRole('region', { name: 'Testverlauf' })

    await expect(history).toContainText(new RegExp(`${completed}\\s+abgeschlossen`, 'i'))
    await expect(history).toContainText(new RegExp(`${passed}\\s+bestanden`, 'i'))
    await expect(history).toContainText(new RegExp(`${failed}\\s+nicht bestanden`, 'i'))
    await expect(history).toContainText(new RegExp(`${unfinished}\\s+unvollständig`, 'i'))
  },
)

When('I export my progress', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download')

  await page.getByRole('button', { name: /^(Export progress|Fortschritt exportieren)$/ }).click()

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

  await page.getByLabel(/^(Import progress|Fortschritt importieren)$/).setInputFiles(path)
})

Then('the import preview describes 1 study attempt', async ({ page }) => {
  await expect(
    page.getByRole('dialog', { name: /^(Import progress|Fortschritt importieren)$/ }),
  ).toContainText(/1 (?:study attempt|Lernversuch)/)
})

Then('the import preview describes 1 completed mock test', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Fortschritt importieren' })).toContainText(
    '1 abgeschlossener Test',
  )
})

When('I confirm replacing local progress', async ({ page }) => {
  await page
    .getByRole('dialog', { name: /^(Import progress|Fortschritt importieren)$/ })
    .getByRole('button', { name: /^(Replace existing data|Vorhandene Daten ersetzen)$/ })
    .click()
})

When('I import an invalid progress file', async ({ page }) => {
  await page.getByLabel('Fortschritt importieren').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('this is not a backup'),
  })
})

Then('I see a backup validation error', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('Ungültige Sicherungsdatei')
})

When('I try to reset progress', async ({ page }) => {
  await page.getByRole('button', { name: 'Fortschritt löschen' }).click()
})

Then('I see a reset confirmation', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Fortschritt löschen' })).toBeVisible()
})

When('I cancel the reset', async ({ page }) => {
  await page
    .getByRole('dialog', { name: 'Fortschritt löschen' })
    .getByRole('button', { name: 'Abbrechen' })
    .click()
})

When('I reset progress after confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Fortschritt löschen' }).click()

  await page
    .getByRole('dialog', { name: 'Fortschritt löschen' })
    .getByRole('button', { name: 'Alles löschen' })
    .click()
})

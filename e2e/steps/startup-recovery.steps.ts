import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { readFile } from 'node:fs/promises'

const { Given, When, Then } = createBdd()

const savedProfiles = new WeakMap<Page, string>()

const downloads = new WeakMap<Page, string>()

const replacementProfile = '{"version":99,"marker":"newer data"}'

const writeProfile = (page: Page, source: string) =>
  page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('einbuergerungstest-learner', 1)
        request.onerror = () => reject(request.error ?? new Error('Could not open test storage.'))

        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction('learner', 'readwrite')

          transaction.objectStore('learner').put(value, 'snapshot')

          transaction.oncomplete = () => {
            database.close()

            resolve()
          }

          transaction.onabort = () => {
            database.close()

            reject(transaction.error ?? new Error('Test storage transaction failed.'))
          }
        }
      }),
    source,
  )

const readProfile = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<unknown>((resolve, reject) => {
        const request = indexedDB.open('einbuergerungstest-learner', 1)
        request.onerror = () => reject(request.error ?? new Error('Could not open test storage.'))

        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction('learner', 'readonly')
          const read = transaction.objectStore('learner').get('snapshot')

          transaction.oncomplete = () => {
            database.close()

            resolve(read.result)
          }

          transaction.onabort = () => {
            database.close()

            reject(transaction.error ?? new Error('Test storage transaction failed.'))
          }
        }
      }),
  )

Given('I open the app with a {word} saved profile', async ({ page }, kind: string) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'Study all questions', exact: true })).toBeVisible()

  const source =
    kind === 'damaged'
      ? '{"version":2,'
      : JSON.stringify({
          version: 1,
          preferences: {
            language: 'en',
            appearance: 'light',
            studyTranslation: false,
            plannedTestDate: null,
          },
          positions: { all: null, groups: {} },
          studyAttempts: [
            { id: 'saved-attempt', questionKey: 'general:1', selectedOption: 'A', answeredAt: 1 },
          ],
          mockSittings: [],
        })

  savedProfiles.set(page, source)

  await writeProfile(page, source)

  await page.reload()
})

Then('startup explains that saved data cannot be loaded', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText(
    'Your saved data isn’t compatible with this version of the app.',
  )
  await expect(page.getByRole('main')).toContainText('Your saved data hasn’t been changed.')
  await expect(page.getByRole('link', { name: 'Study all questions', exact: true })).toHaveCount(0)
})

Then('the original saved profile is unchanged', async ({ page }) => {
  expect(await readProfile(page)).toBe(savedProfiles.get(page))
})

When('I download the saved data from startup recovery', async ({ page }) => {
  const pending = page.waitForEvent('download')

  await page.getByRole('button', { name: 'Download saved data', exact: true }).click()

  const download = await pending
  const path = await download.path()

  if (!path) {
    throw new Error('No saved-data download was produced.')
  }

  downloads.set(page, await readFile(path, 'utf8'))
})

Then('the download contains the original saved profile', ({ page }) => {
  expect(downloads.get(page)).toBe(savedProfiles.get(page))
})

When('I request a fresh profile from startup recovery', async ({ page }) => {
  await page.getByRole('button', { name: 'Start with a fresh profile', exact: true }).click()

  await expect(page.getByRole('dialog')).toBeVisible()
})

When('I cancel the startup reset', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
})

When('I confirm the startup reset', async ({ page }) => {
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Reset saved data', exact: true })
    .click()
})

When('another window replaces the rejected profile', async ({ page }) => {
  const other = await page.context().newPage()

  await other.goto('/')

  await expect(other.getByRole('alert')).toContainText('A fresh start is needed')

  await writeProfile(other, replacementProfile)

  await other.close()
})

Then('startup reset offers conflict recovery', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Your data changed in another app window.',
  )
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Reload app' })).toBeVisible()
})

Then('the replacement profile is unchanged', async ({ page }) => {
  expect(await readProfile(page)).toBe(replacementProfile)
})

Given('the question bank cannot be downloaded', async ({ page }) => {
  await page.route('**/questionbank-berlin.json', (route) => route.abort())

  await page.goto('/')
})

Then('startup offers retry without reset', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('The app could not load.')
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start with a fresh profile' })).toHaveCount(0)
})

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { createLearnerSnapshot } from '../../web/src/modules/learner-state/domain/learner-state'
import { decodeLearnerSnapshot } from '../../web/src/modules/learner-state/infrastructure/snapshot-codec'
import { sourceQuestion } from '../support/browser'

export const progressFixture = () => {
  const now = Date.now()
  const tomorrow = new Date(now + 24 * 60 * 60 * 1000)
  const plannedTestDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  const initial = createLearnerSnapshot()

  const snapshot = {
    ...initial,
    preferences: { ...initial.preferences, plannedTestDate },
    studyAttempts: [
      {
        id: 'study-before-backup',
        questionKey: sourceQuestion(1).id,
        selectedOption: 'A',
        answeredAt: now - 120_000,
      },
    ],
    mockSittings: [
      {
        id: 'completed-before-backup',
        startedAt: now - 120_000,
        deadline: now + 3_480_000,
        endedAt: now - 60_000,
        currentQuestion: 0,
        status: 'completed',
        finishReason: 'submitted',
        answers: [...Array.from({ length: 30 }, (_, index) => index + 1), 301, 302, 303].map(
          (order) => ({ questionKey: sourceQuestion(order).id, selectedOption: null }),
        ),
      },
    ],
  }

  return decodeLearnerSnapshot(JSON.stringify(snapshot))
}

export const seedProfile = async (page: Page, source = JSON.stringify(progressFixture())) => {
  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible()

  await page.evaluate(async (value) => {
    await new Promise<void>((resolve, reject) => {
      const opening = indexedDB.open('einbuergerungstest-learner', 1)
      opening.onupgradeneeded = () => opening.result.createObjectStore('learner')
      opening.onerror = () => reject(opening.error ?? new Error('Cannot open test storage'))

      opening.onsuccess = () => {
        const db = opening.result
        const transaction = db.transaction('learner', 'readwrite')

        transaction.objectStore('learner').put(value, 'snapshot')

        transaction.oncomplete = () => {
          db.close()

          resolve()
        }

        transaction.onabort = () => {
          db.close()

          reject(transaction.error ?? new Error('Test storage transaction failed'))
        }
      }
    })
  }, source)

  await page.reload()
}

export const openSettings = async (page: Page) => {
  await page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click()
}

export const expectEmptyHistory = async (page: Page) => {
  await page.getByRole('navigation').getByRole('link', { name: 'Progress', exact: true }).click()

  await expect(page.getByText('Not started · 310', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Mock tests', exact: true })).toContainText(
    '0 completed',
  )
}

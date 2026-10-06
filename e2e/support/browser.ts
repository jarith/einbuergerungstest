import type { Page } from '@playwright/test'

import questionBank from '../../web/public/questionbank-berlin.json' with { type: 'json' }

export const sourceQuestion = (number: number) => {
  const question = questionBank.questions[number - 1]

  if (question === undefined || question.order !== number) {
    throw new Error(`Question ${number} is missing from the source bank.`)
  }

  return question
}

export const studyAnswer = (page: Page, label: string) =>
  page.getByRole('radio', { name: new RegExp(`^${label}(?:\\b|[.:])`) })

export const mockAnswer = (page: Page, label: string) =>
  page.getByRole('radio', { name: new RegExp(`^${label}(?:\\b|[.:])`) })

export const questionStatusLabel = (status: string) => {
  switch (status) {
    case 'not-started':
      return '(?:Not started|Nicht begonnen)'
    case 'needs-review':
      return '(?:Needs review|Wiederholen)'
    case 'learning':
      return '(?:Learning|Im Lernen)'
    case 'learned':
      return '(?:Learned|Gelernt)'
    default:
      throw new Error(`Unknown question status: ${status}`)
  }
}

export const openNavigation = async (page: Page, href: string) => {
  await page.getByRole('navigation').locator(`a[href="${href}"]`).click()
}

export const openBackup = async (page: Page) => {
  const disclosure = page.locator('details').filter({ has: page.locator('summary') })

  if ((await disclosure.count()) && (await disclosure.getAttribute('open')) === null) {
    await disclosure.locator('summary').click()
  }
}

export const downloadBackup = async (page: Page) => {
  await openBackup(page)

  const pending = page.waitForEvent('download')

  await page.getByRole('button', { name: /^(Download backup|Sicherung herunterladen)$/ }).click()

  const download = await pending
  const path = await download.path()

  if (!path) {
    throw new Error('The progress export did not produce a local file.')
  }

  return path
}

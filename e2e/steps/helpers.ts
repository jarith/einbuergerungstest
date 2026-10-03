import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import questionBank from '../../web/public/questionbank-berlin.json' with { type: 'json' }

export const sourceQuestion = (number: number) => {
  const question = questionBank.questions[number - 1]

  if (!question || question.number !== number) {
    throw new Error(`Question ${number} is missing from the source bank.`)
  }

  return question
}

export const sourceQuestionOnPage = async (page: Page) => {
  const text = (await page.locator('h2[lang=de]').innerText()).trim()
  const options = await page.getByRole('radio').locator('span[lang=de]').allTextContents()

  const image = await page
    .getByRole('img', { name: /Illustration for question|Abbildung zu Frage/ })
    .all()

  const imageAlt = image[0] === undefined ? null : await image[0].getAttribute('alt')

  const candidates = questionBank.questions.filter(
    (candidate) =>
      candidate.question_de === text &&
      candidate.answer_options.every((option, index) => option.text_de === options[index]),
  )

  const routeKey = decodeURIComponent(new URL(page.url()).pathname.split('/').at(-1) ?? '')

  const question =
    candidates.find(
      (candidate) => `${candidate.section}:${candidate.source_question_id}` === routeKey,
    ) ??
    candidates.find((candidate) => imageAlt?.endsWith(` ${candidate.number}`) ?? false) ??
    (candidates.length === 1 ? candidates[0] : undefined)

  if (!question) {
    throw new Error(`Visible question is not uniquely identified in the source bank: ${text}`)
  }

  return question
}

export const studyAnswer = (page: Page, label: string) =>
  page.getByRole('radio', { name: new RegExp(`^${label}(?:\\b|[.:])`) })

export const mockAnswer = (page: Page, label: string) =>
  page.getByRole('radio', { name: new RegExp(`^${label}(?:\\b|[.:])`) })

const colorMatches = (value: string, hue: 'red' | 'green') => {
  const channels = value
    .match(/\d+(?:\.\d+)?/g)
    ?.slice(0, 3)
    .map(Number)

  if (!channels || channels.length !== 3) {
    return false
  }

  const [red, green, blue] = channels

  if (red === undefined || green === undefined || blue === undefined) {
    return false
  }

  return hue === 'red' ? red > green + 10 && red > blue + 10 : green > red + 10 && green > blue + 5
}

export const expectHighlight = async (option: Locator, hue: 'red' | 'green') => {
  const colors = await option.evaluate((element) => {
    const style = getComputedStyle(element)

    return [style.backgroundColor, style.borderColor, style.color]
  })

  expect(colors.some((color) => colorMatches(color, hue))).toBe(true)
}

export const questionStatusLabel = (status: string) => {
  switch (status) {
    case 'not-started':
      return '(?:Not started|Nicht begonnen)'
    case 'needs-review':
      return '(?:Needs review|Wiederholen)'
    case 'learning':
      return '(?:Learning|In Bearbeitung)'
    case 'learned':
      return '(?:Learned|Gelernt)'
    default:
      throw new Error(`Unknown question status: ${status}`)
  }
}

export const openNavigation = async (page: Page, href: string) => {
  await page.getByRole('navigation').locator(`a[href="${href}"]`).click()
}

export const questionRow = async (page: Page, number: number) => {
  await openNavigation(page, '/progress')

  await page
    .getByRole('link', { name: /^(Browse all 310 questions|Alle 310 Fragen ansehen)/ })
    .click()

  const question = sourceQuestion(number)
  const key = encodeURIComponent(`${question.section}:${question.source_question_id}`)
  const row = page.getByRole('link').and(page.locator(`a[href="/progress/questions/${key}"]`))

  // Sequentially reveal the requested row through the learner-facing pagination.
  // oxlint-disable-next-line app/prefer-array-methods
  while ((await row.count()) === 0) {
    await page.getByRole('button', { name: /^(Show next|Nächste) / }).click()
  }

  return row
}

export const openBackup = async (page: Page) => {
  const disclosure = page.locator('details').filter({ has: page.locator('summary') })

  if ((await disclosure.count()) && (await disclosure.getAttribute('open')) === null) {
    await disclosure.locator('summary').click()
  }
}

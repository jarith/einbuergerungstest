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
  const text = (await page.getByRole('heading', { level: 2 }).innerText()).trim()
  const question = questionBank.questions.find((candidate) => candidate.question_de === text)

  if (!question) {
    throw new Error(`Visible question is not in the source bank: ${text}`)
  }

  return question
}

export const sourceQuestionInText = (visibleText: string) => {
  const question = questionBank.questions.find((candidate) =>
    visibleText.includes(candidate.question_de),
  )

  if (!question) {
    throw new Error('Reviewed question is not in the source bank.')
  }

  return question
}

export const studyAnswer = (page: Page, label: string) =>
  page.getByRole('button', { name: new RegExp(`^${label}(?:\\b|[.:])`) })

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

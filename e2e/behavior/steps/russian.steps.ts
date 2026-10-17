import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

Then(
  'German and Russian content for the current study question and its options is available',
  async ({ page }) => {
    const result = await page.evaluate(() => {
      const question = window.behavior.study()().question

      return {
        question,
        content: window.behavior.resources().localization.getQuestion(question, 'study'),
      }
    })

    expect(result.content.german).toBe(result.question.question_de)
    expect(result.content.translation).toBe(result.question.question_ru)
    expect(result.content.options).toEqual([
      {
        label: 'A',
        german: result.question.answer_options[0]?.text_de,
        translation: result.question.answer_options[0]?.text_ru,
      },
      {
        label: 'B',
        german: result.question.answer_options[1]?.text_de,
        translation: result.question.answer_options[1]?.text_ru,
      },
      {
        label: 'C',
        german: result.question.answer_options[2]?.text_de,
        translation: result.question.answer_options[2]?.text_ru,
      },
      {
        label: 'D',
        german: result.question.answer_options[3]?.text_de,
        translation: result.question.answer_options[3]?.text_ru,
      },
    ])
  },
)

Then(
  'German and Russian content for the completed review question and its options is available',
  async ({ page }) => {
    const result = await page.evaluate(() => {
      const question = window.behavior.review()().loaded.question

      return {
        question,
        content: window.behavior.resources().localization.getQuestion(question, 'completed-review'),
      }
    })

    expect(result.content.german).toBe(result.question.question_de)
    expect(result.content.translation).toBe(result.question.question_ru)
    expect(result.content.options).toEqual([
      {
        label: 'A',
        german: result.question.answer_options[0]?.text_de,
        translation: result.question.answer_options[0]?.text_ru,
      },
      {
        label: 'B',
        german: result.question.answer_options[1]?.text_de,
        translation: result.question.answer_options[1]?.text_ru,
      },
      {
        label: 'C',
        german: result.question.answer_options[2]?.text_de,
        translation: result.question.answer_options[2]?.text_ru,
      },
      {
        label: 'D',
        german: result.question.answer_options[3]?.text_de,
        translation: result.question.answer_options[3]?.text_ru,
      },
    ])
  },
)

import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import bank from '../../../web/public/questionbank-berlin.json' with { type: 'json' }

const { When, Then } = createBdd()

When('I start a new all-question study session', async ({ page }) => {
  await page.evaluate(() => window.behavior.startStudy())
})

When('I start a new study session at question {int}', async ({ page }, order: number) => {
  await page.evaluate((number) => window.behavior.startStudy(number), order)
})

When('I select study answer {string}', async ({ page }, label: string) => {
  if (label !== 'A' && label !== 'B' && label !== 'C' && label !== 'D') {
    throw new Error(`Unknown answer ${label}`)
  }

  await page.evaluate<void, 'A' | 'B' | 'C' | 'D'>(
    (value) => window.behavior.answerStudy(value),
    label,
  )

  expect(await page.evaluate(() => window.behavior.study().error())).toBeNull()
})
Then('the current study question is {int} of 310', async ({ page }, order: number) => {
  expect(
    await page.evaluate(() => ({
      order: window.behavior.study()().question.order,
      total: window.behavior.study()().total,
    })),
  ).toEqual({ order, total: 310 })
})
Then('the study answer is incorrect and identifies the correct option', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.feedback())).toBe('incorrect')
  expect(await page.evaluate(() => window.behavior.study()().question.correct_option)).toBe('D')
})
Then('the study answer is correct', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.feedback())).toBe('correct')
})
Then('the correct study option is {string}', async ({ page }, option: string) => {
  expect(await page.evaluate(() => window.behavior.study()().question.correct_option)).toBe(option)
})

When('I go to the next study question', async ({ page }) => {
  await page.evaluate(() => window.behavior.navigateStudy('next'))
})

When('I go to the previous study question', async ({ page }) => {
  await page.evaluate(() => window.behavior.navigateStudy('previous'))
})

When('I enable {word} translation', async ({ page }, language: string) => {
  if (language !== 'English' && language !== 'Russian') {
    throw new Error(`Unknown translation language ${language}`)
  }

  await page.evaluate(() =>
    window.behavior.resources().learner.updatePreferences({ studyTranslation: true }),
  )
})

Then(
  'German and English content for study question {int} and its options is available',
  async ({ page }, order: number) => {
    const result = await page.evaluate(() => {
      const question = window.behavior.study()().question

      return {
        content: window.behavior.resources().localization.getQuestion(question, 'study'),
        question,
      }
    })

    expect(result.question.order).toBe(order)
    expect(result.content).toEqual({
      german: result.question.question_de,
      translation: result.question.question_en,
      options: result.question.answer_options.map((option) => ({
        label: option.label,
        german: option.text_de,
        translation: option.text_en,
      })),
    })
  },
)
Then(
  'the original German content for study question {int} is available without translation',
  async ({ page }, order: number) => {
    const result = await page.evaluate(() => {
      const question = window.behavior.study()().question

      return {
        content: window.behavior.resources().localization.getQuestion(question, 'study'),
        question,
      }
    })

    expect(result.question.order).toBe(order)
    expect(result.content).toEqual({
      german: result.question.question_de,
      translation: null,
      options: result.question.answer_options.map((option) => ({
        label: option.label,
        german: option.text_de,
        translation: null,
      })),
    })
  },
)
Then('translation is unavailable in the current learning activity', async ({ page }) => {
  expect(
    await page.evaluate(() =>
      window.behavior
        .resources()
        .localization.canTranslate(window.behavior.state.study ? 'study' : 'completed-review'),
    ),
  ).toBe(false)
})
Then('the study question includes its illustration', async ({ page }) => {
  const image = await page.evaluate(
    () => window.behavior.resources().questions.getQuestion(window.behavior.study()().key)?.image,
  )

  expect(image?.url).toContain('question-021')
  expect(image?.variants.length).toBeGreaterThan(0)
})
Then('this answer is the transition to Learned', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.study()().hasJustLearned)).toBe(true)
  expect(await page.evaluate(() => window.behavior.feedback())).toBe('correct')
})
Then('this correct answer is not a new transition to Learned', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.study()().hasJustLearned)).toBe(false)
  expect(await page.evaluate(() => window.behavior.feedback())).toBe('correct')
})
Then('the current study question has no session answer or feedback', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.study()().selectedOption)).toBeNull()
  expect(await page.evaluate(() => window.behavior.feedback())).toBe('hidden')
})

When('I choose the {string} group', async ({ page }, title: string) => {
  await page.evaluate((name) => {
    const group = window.behavior
      .resources()
      .questions.bank.groups.find((item) => item.title === name)

    if (!group) {
      throw new Error(`Unknown group ${name}`)
    }

    return window.behavior.startStudy(undefined, group.id)
  }, title)
})

Then('question {int} is the current group question', async ({ page }, order: number) => {
  expect(await page.evaluate(() => window.behavior.study()().question.order)).toBe(order)
})
When('I answer and advance through the Berlin group to its final question', async ({ page }) => {
  const expectedOrders = [301, 302, 303, 304, 305, 306, 307, 308, 309]

  const observedOrders = await expectedOrders.reduce(async (pendingOrders) => {
    const orders = await pendingOrders
    const order = await page.evaluate(() => window.behavior.study()().question.order)

    await page.evaluate(() =>
      window.behavior.answerStudy(window.behavior.study()().question.correct_option),
    )

    await page.evaluate(() => window.behavior.navigateStudy('next'))

    orders.push(order)

    return orders
  }, Promise.resolve<number[]>([]))

  expect(observedOrders).toEqual(expectedOrders)
})

When('I finish the group', async ({ page }) => {
  await page.evaluate(() => window.behavior.navigateStudy('next'))
})

Then('the group pass is completed', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.study()().isCompleted)).toBe(true)
})

When('I review the completed group', async ({ page }) => {
  await page.evaluate(() => window.behavior.restartStudy())
})

Then(
  'the group catalog includes every group with its description and question count',
  async ({ page }) => {
    const expectedGroupCount = 14

    // Counts from the study-note assignment manifest in docs/question-groups.md.
    const expectedCounts = new Map([
      ['fundamental-rights', 20],
      ['state-structure', 56],
      ['elections-civic-participation', 36],
      ['rule-of-law-courts', 21],
      ['social-security', 17],
      ['history-until-war-end', 15],
      ['postwar-history', 39],
      ['reunification', 7],
      ['europe-eu', 20],
      ['symbols-holidays-culture', 13],
      ['education-family-everyday-life', 42],
      ['jewish-life-antisemitism', 10],
      ['migration', 4],
      ['berlin', 10],
    ])

    const expectedGroups = bank.groups.map(({ id, title, description }) => ({
      id,
      title,
      description,
      total: expectedCounts.get(id),
    }))

    const groups = await page.evaluate(() =>
      window.behavior
        .dashboard()
        .groups()
        .map(({ id, title, description, total }) => ({
          id,
          title,
          description,
          total,
        })),
    )

    expect(groups).toHaveLength(expectedGroupCount)
    expect(groups).toEqual(expect.arrayContaining(expectedGroups))
  },
)
Then('every question group has zero progress', async ({ page }) => {
  const expectedGroupCount = 14
  const expectedGroups = bank.groups.map(({ id }) => ({ id, contributing: 0, percentage: 0 }))

  const groups = await page.evaluate(() =>
    [...window.behavior.resources().learner.progress.groups()].map(
      ([id, { contributing, percentage }]) => ({ id, contributing, percentage }),
    ),
  )

  expect(groups).toHaveLength(expectedGroupCount)
  expect(groups).toEqual(expect.arrayContaining(expectedGroups))
})
Then(
  'the {string} group shows {int} of {int} contributing to progress and {int} percent',
  async ({ page }, title: string, contributing: number, total: number, percentage: number) => {
    expect(
      await page.evaluate(
        (name) =>
          window.behavior
            .dashboard()
            .groups()
            .find((group) => group.title === name),
        title,
      ),
    ).toMatchObject({ contributing, total, percentage })
  },
)

When('I remember the first mock question', async ({ page }) => {
  await page.evaluate(() => {
    const key = window.behavior.sitting().answers[0]?.questionKey

    const question = window.behavior
      .resources()
      .questions.bank.questions.find((item) => item.id === key)

    if (!question) {
      throw new Error('Missing mock question')
    }
    window.behavior.state.notedQuestion = question.order
  })
})

Then(
  "the noted mock question's group shows one question contributing to progress",
  async ({ page }) => {
    expect(
      await page.evaluate(
        () =>
          window.behavior
            .resources()
            .learner.progress.groups()
            .get(window.behavior.question(window.behavior.state.notedQuestion).group_id)
            ?.contributing,
      ),
    ).toBe(1)
  },
)
Then('the Fundamental rights group has a German title and description', async ({ page }) => {
  const result = await page.evaluate(() => {
    const group = window.behavior
      .resources()
      .questions.bank.groups.find((item) => item.title === 'Fundamental rights')

    if (!group) {
      throw new Error('Missing group')
    }

    return { actual: window.behavior.resources().localization.getGroup(group), expected: group }
  })

  expect(result.actual).toMatchObject({
    title: result.expected.title_de,
    description: result.expected.description_de,
  })
})

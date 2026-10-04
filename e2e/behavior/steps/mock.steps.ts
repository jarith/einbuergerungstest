import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

When('I start a mock test', async ({ page }) => {
  await page.evaluate(() => window.behavior.startMock())
})

Given('the mock includes a question with language-neutral choices first', async ({ page }) => {
  await page.evaluate(() => {
    window.behavior.state.neutralFirst = true
  })
})

Then('the mock question includes a language-neutral choice', async ({ page }) => {
  expect(
    await page.evaluate(() => {
      const first = window.behavior.sitting().answers[0]

      return (
        first &&
        window.behavior
          .resources()
          .questions.getQuestion(first.questionKey)
          ?.question.answer_options.some((option) => option.text_de === option.text_en)
      )
    }),
  ).toBe(true)
})

Given('I import a study attempt dated tomorrow', async ({ page }) => {
  // Build a valid backup through the application, then alter only its external timestamp fixture.
  await page.evaluate(() =>
    window.behavior.resources().learner.recordStudyAnswer(window.behavior.question(1).id, 'D'),
  )

  const snapshot = await page.evaluate(() => window.behavior.resources().learner())

  if (!snapshot) {
    throw new Error('Missing learner')
  }
  const tomorrow = await page.evaluate(() => Date.now() + 24 * 60 * 60 * 1000)

  const source = JSON.stringify({
    ...snapshot,
    studyAttempts: snapshot.studyAttempts.map((attempt) => ({ ...attempt, answeredAt: tomorrow })),
  })

  await page.evaluate((backup) => window.behavior.resources().learner.previewImport(backup), source)

  await page.evaluate(() => window.behavior.resources().learner.confirmReplacement())
})

When('the device clock moves backward one day', async ({ page }) => {
  const now = await page.evaluate(() => Date.now())

  await page.clock.setSystemTime(now - 24 * 60 * 60 * 1000)
})

Then('the mock has {int} minutes remaining', async ({ page }, minutes: number) => {
  expect(await page.evaluate(() => window.behavior.remaining())).toBe(minutes * 60)
})
Then('the mock contains 30 general and 3 Berlin questions without repeats', async ({ page }) => {
  const questions = await page.evaluate(() =>
    window.behavior
      .sitting()
      .answers.map(
        (answer) => window.behavior.resources().questions.getQuestion(answer.questionKey)?.question,
      ),
  )

  expect(questions.filter((question) => question?.section === 'general')).toHaveLength(30)
  expect(questions.filter((question) => question?.section === 'berlin')).toHaveLength(3)
  expect(new Set(questions.map((question) => question?.id)).size).toBe(33)
})
Then('English translation is unavailable in the live mock', async ({ page }) => {
  expect(
    await page.evaluate(() => window.behavior.resources().localization.canTranslate('live-mock')),
  ).toBe(false)
})
Then('the live mock question and choices are in German', async ({ page }) => {
  const result = await page.evaluate(() => {
    const first = window.behavior.sitting().answers[0]
    const loaded = first && window.behavior.resources().questions.getQuestion(first.questionKey)

    if (!loaded) {
      throw new Error('Missing mock question')
    }

    return {
      question: loaded.question,
      content: window.behavior.resources().localization.getQuestion(loaded.question, 'live-mock'),
    }
  })

  expect(result.content).toEqual({
    german: result.question.question_de,
    english: null,
    options: result.question.answer_options.map((option) => ({
      label: option.label,
      german: option.text_de,
      english: null,
    })),
  })
})

When('I select mock answer {string}', async ({ page }, selection: string) => {
  if (selection !== 'A' && selection !== 'B' && selection !== 'C' && selection !== 'D') {
    throw new Error(`Unknown selection ${selection}`)
  }

  await page.evaluate<void, 'A' | 'B' | 'C' | 'D'>((option) => {
    const sitting = window.behavior.sitting()
    const answer = sitting.answers[sitting.currentQuestion]

    if (!answer) {
      throw new Error('Missing mock answer')
    }

    return window.behavior.resources().mock.select(answer.questionKey, option)
  }, selection)
})

When('I change mock answer to {string}', async ({ page }, selection: string) => {
  if (selection !== 'A' && selection !== 'B' && selection !== 'C' && selection !== 'D') {
    throw new Error(`Unknown selection ${selection}`)
  }

  await page.evaluate<void, 'A' | 'B' | 'C' | 'D'>((option) => {
    const answer = window.behavior.sitting().answers[0]

    if (!answer) {
      throw new Error('Missing first answer')
    }

    return window.behavior.resources().mock.select(answer.questionKey, option)
  }, selection)
})

Then('the selected mock answer is {string}', async ({ page }, option: string) => {
  expect(
    await page.evaluate(() => {
      const sitting = window.behavior.sitting()

      return sitting.answers[sitting.currentQuestion]?.selectedOption
    }),
  ).toBe(option)
})
Then('answer correctness is withheld', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.mockFeedback())).toBe('hidden')
  expect(
    await page.evaluate(() => window.behavior.resources().learner.progress.mocks().at(-1)?.score),
  ).toBeNull()
})

When('I go to the next mock question', async ({ page }) => {
  await page.evaluate(() =>
    window.behavior
      .resources()
      .learner.navigateMock(
        window.behavior.sitting().id,
        window.behavior.sitting().currentQuestion + 1,
      ),
  )
})

When('I go to the previous mock question', async ({ page }) => {
  await page.evaluate(() =>
    window.behavior
      .resources()
      .learner.navigateMock(
        window.behavior.sitting().id,
        window.behavior.sitting().currentQuestion - 1,
      ),
  )
})

When('I request mock submission', async ({ page }) => {
  await page.evaluate(() => window.behavior.resources().mock.submit())
})

Then('submission awaits confirmation for 33 unanswered questions', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.resources().mock.submission())).toBe(true)
  expect(await page.evaluate(() => window.behavior.resources().mock.unanswered())).toBe(33)
  expect(await page.evaluate(() => window.behavior.sitting().status)).toBe('active')
})

When('I cancel mock submission', async ({ page }) => {
  await page.evaluate(() => window.behavior.resources().mock.cancelSubmission())
})

Then('the mock remains active', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.sitting().status)).toBe('active')
})

When('I confirm submitting the mock with unanswered questions', async ({ page }) => {
  await page.evaluate(() => window.behavior.resources().mock.submit())

  await page.evaluate(() => window.behavior.resources().mock.confirmSubmission())
})

Then(
  'the mock result is {int} of 33 and {string}',
  async ({ page }, score: number, result: string) => {
    await expect
      .poll(() => page.evaluate(() => window.behavior.resources().learner.progress.mocks().at(-1)))
      .toMatchObject({ status: 'completed', total: 33, score, result })
  },
)

When(
  'I answer {int} mock questions correctly and leave the rest blank',
  async ({ page }, correct: number) => {
    for (let index = 0; index < correct; index += 1) {
      await page.evaluate((position) => {
        const answer = window.behavior.sitting().answers[position]

        const question =
          answer && window.behavior.resources().questions.getQuestion(answer.questionKey)?.question

        if (!question) {
          throw new Error('Missing mock question')
        }

        return window.behavior.resources().mock.select(question.id, question.correct_option)
      }, index)
    }
  },
)

When('I answer the first mock question correctly', async ({ page }) => {
  await page.evaluate(() => {
    const first = window.behavior.sitting().answers[0]

    const question =
      first && window.behavior.resources().questions.getQuestion(first.questionKey)?.question

    if (!question) {
      throw new Error('Missing first question')
    }
    window.behavior.state.notedQuestion = question.order

    return window.behavior.resources().mock.select(question.id, question.correct_option)
  })
})

Then('that mock question has status {string}', async ({ page }, status: string) => {
  expect(
    await page.evaluate(
      () => window.behavior.progress(window.behavior.state.notedQuestion)?.status,
    ),
  ).toBe(status)
})

When('60 minutes pass', async ({ page }) => {
  await page.clock.fastForward(3_600_000)
})

When('the learner pauses for 5 minutes without ending the session', async ({ page }) => {
  await page.clock.fastForward(300_000)
})

When('I request to end the mock early', async ({ page }) => {
  await page.evaluate(() => window.behavior.requestExit())
})

Then('ending the mock awaits confirmation', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.navigation())).toBe(true)
  expect(await page.evaluate(() => window.behavior.sitting().status)).toBe('active')
})

When('I cancel ending the mock', async ({ page }) => {
  await page.evaluate(() => window.behavior.navigation.cancel())
})

When('I confirm ending the mock early', async ({ page }) => {
  await page.evaluate(() => window.behavior.requestExit())

  await page.evaluate(() => window.behavior.navigation.confirm())
})

Then('the saved mock is unfinished and has no score', async ({ page }) => {
  expect(
    await page.evaluate(() => window.behavior.resources().learner.progress.mocks().at(-1)),
  ).toMatchObject({ status: 'unfinished', score: null, result: null })
})

When('I review the completed mock', async ({ page }) => {
  await page.evaluate(() => {
    window.behavior.review()()
  })
})

When('I review the unfinished mock', async ({ page }) => {
  await page.evaluate(() => {
    window.behavior.review()()
  })
})

Then('the completed review includes every question and correct answer', async ({ page }) => {
  const entries = await page.evaluate(() => window.behavior.review().entries())
  expect(entries).toHaveLength(33)

  for (let index = 0; index < 33; index += 1) {
    await page.evaluate((position) => window.behavior.review().go(position), index)

    const entry = await page.evaluate(() => window.behavior.review()())

    expect(entry.loaded.question.answer_options.map((option) => option.label)).toContain(
      entry.loaded.question.correct_option,
    )
    expect(entries[index]?.feedback).not.toBe('hidden')
  }

  await page.evaluate(() => window.behavior.review().go(0))
})
Then(
  'the unfinished review retains answer {string} without grading',
  async ({ page }, option: string) => {
    expect(await page.evaluate(() => window.behavior.review()())).toMatchObject({
      answer: { selectedOption: option },
      summary: { status: 'unfinished', score: null },
    })
    expect(
      await page.evaluate(() =>
        window.behavior
          .review()
          .entries()
          .every((entry) => entry.feedback === 'hidden'),
      ),
    ).toBe(true)
  },
)

When('I enable English translation in the review', async ({ page }) => {
  await page.evaluate(() => window.behavior.review().setTranslation(true))
})

Then('German and English appear together in the review', async ({ page }) => {
  const result = await page.evaluate(() => {
    const question = window.behavior.review()().loaded.question

    return {
      question,
      content: window.behavior.resources().localization.getQuestion(question, 'completed-review'),
    }
  })

  expect(result.content).toEqual({
    german: result.question.question_de,
    english: result.question.question_en,
    options: result.question.answer_options.map((option) => ({
      label: option.label,
      german: option.text_de,
      english: option.text_en,
    })),
  })
})
Then('the review reports manual submission', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.review()().finishReason)).toBe('submitted')
})
Then('the review reports deadline expiry', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.review()().finishReason)).toBe('timeout')
})

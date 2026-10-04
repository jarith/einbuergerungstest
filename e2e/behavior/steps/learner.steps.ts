import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Before, Given, When, Then } = createBdd()

Before(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T10:00:00Z') })

  await page.goto('/e2e/behavior/')

  await page.waitForFunction(() => Boolean(window.behavior))
})

Given('a learner has no saved history', async ({ page }) => {
  await page.evaluate(() => window.behavior.launch())
})

Given('a learner starts on local date {string}', async ({ page }, date: string) => {
  await page.clock.setSystemTime(new Date(`${date}T12:00:00+02:00`))

  await page.evaluate(() => window.behavior.launch())
})

Given('the current time is {string}', async ({ page }, instant: string) => {
  await page.clock.setSystemTime(new Date(instant))
})

When('I choose {word} as my preferred language', async ({ page }, language: string) => {
  if (language !== 'English' && language !== 'German') {
    throw new Error(`Unknown language ${language}`)
  }

  await page.evaluate<void, 'en' | 'de'>(
    (value) => window.behavior.resources().learner.updatePreferences({ language: value }),
    language === 'German' ? 'de' : 'en',
  )
})

Then('my preferred language is {word}', async ({ page }, language: string) => {
  expect(await page.evaluate(() => window.behavior.resources().localization.language())).toBe(
    language === 'German' ? 'de' : 'en',
  )
})

When('I restart with my saved history', async ({ page }) => {
  await page.evaluate(() => window.behavior.restart())
})

When('I set the test date to {string}', async ({ page }, date: string) => {
  await page.evaluate(
    (plannedTestDate) => window.behavior.resources().learner.updatePreferences({ plannedTestDate }),
    date,
  )
})

When('I try to set the test date to {string}', async ({ page }, date: string) => {
  await expect(
    page.evaluate(
      (plannedTestDate) =>
        window.behavior.resources().learner.updatePreferences({ plannedTestDate }),
      date,
    ),
  ).rejects.toThrow('future')
})
Then('the past test date is rejected', async ({ page }) => {
  expect(
    await page.evaluate(() => window.behavior.resources().learner()?.preferences.plannedTestDate),
  ).toBeNull()
})

When('I clear the test date', async ({ page }) => {
  await page.evaluate(() =>
    window.behavior.resources().learner.updatePreferences({ plannedTestDate: null }),
  )
})

Then('the test date is empty', async ({ page }) => {
  expect(
    await page.evaluate(() => window.behavior.resources().learner()?.preferences.plannedTestDate),
  ).toBeNull()
})
Then('the test date remains {string}', async ({ page }, date: string) => {
  expect(
    await page.evaluate(() => window.behavior.resources().learner()?.preferences.plannedTestDate),
  ).toBe(date)
})

When('the local date becomes {string}', async ({ page }, date: string) => {
  await page.clock.setSystemTime(new Date(`${date}T12:00:00+02:00`))
})

When('the learner resumes at {string}', async ({ page }, instant: string) => {
  await page.clock.setSystemTime(new Date(instant))

  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
})

When('1 minute passes', async ({ page }) => {
  await page.clock.fastForward(60_000)
})

Then('there are {int} local calendar days until the test', async ({ page }, days: number) => {
  expect(await page.evaluate(() => window.behavior.dashboard().date()?.days)).toBe(days)
})
Then('the planned test is today', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.dashboard().date()?.days)).toBe(0)
})
Then('there is no current test countdown', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.dashboard().date())).toBeNull()
})
Then(
  'overall progress is {int} of 310 questions contributing to progress and {int} percent',
  async ({ page }, contributing: number, percent: number) => {
    expect(
      await page.evaluate(() => window.behavior.resources().learner.progress.totals()),
    ).toMatchObject({ total: 310, contributing, percentage: percent })
  },
)
Then('question {int} has status {string}', async ({ page }, order: number, status: string) => {
  expect(await page.evaluate((number) => window.behavior.progress(number)?.status, order)).toBe(
    status,
  )
})
Then(
  'question {int} has {int} recorded attempt(s)',
  async ({ page }, order: number, count: number) => {
    expect(
      await page.evaluate((number) => window.behavior.progress(number)?.attemptCount, order),
    ).toBe(count)
  },
)
Then(
  'the question totals are {int} not started, {int} needing review, {int} learning, and {int} learned',
  async ({ page }, notStarted: number, needsReview: number, learning: number, learned: number) => {
    expect(await page.evaluate(() => window.behavior.list().totals().statuses)).toEqual({
      'not-started': notStarted,
      'needs-review': needsReview,
      learning,
      learned,
    })
  },
)
Then(
  'the mock totals are {int} completed, {int} passed, {int} failed, and {int} unfinished',
  async ({ page }, completed: number, passed: number, failed: number, unfinished: number) => {
    expect(
      await page.evaluate(() => window.behavior.resources().learner.progress.mockTotals()),
    ).toMatchObject({ completed, passed, failed, unfinished })
  },
)

When('I filter questions by {string}', async ({ page }, status: string) => {
  if (status !== 'learned' && status !== 'learning') {
    throw new Error(`Unsupported fixture filter ${status}`)
  }

  await page.evaluate<void, 'learning' | 'learned'>(
    (value) => window.behavior.list().setFilter(value),
    status,
  )
})

Then('there are no questions in this status', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.list().total())).toBe(0)
})

When('I create a backup of my progress', async ({ page }) => {
  const source = await page.evaluate(() => window.behavior.resources().learner.exportBackup())

  await page.evaluate((value) => {
    window.behavior.state.exported = value
  }, source)
})

When('I preview the saved backup', async ({ page }) => {
  await page.evaluate(() => {
    const source = window.behavior.state.exported

    if (source === undefined) {
      throw new Error('Create a backup first.')
    }

    return window.behavior.backup().selectFile(new File([source], 'backup.json'))
  })
})

Then('the import preview describes 1 study attempt', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.backup()())).toMatchObject({
    kind: 'import',
    studyAttempts: 1,
  })
})
Then('the import preview describes 1 completed mock test', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.backup()())).toMatchObject({
    kind: 'import',
    completedMocks: 1,
  })
})
When('I confirm replacing local progress', async ({ page }) => {
  await page.evaluate(() => window.behavior.backup().confirm())

  expect(await page.evaluate(() => window.behavior.backup().message())).toBe('replaced')
})

When('I preview an invalid backup', async ({ page }) => {
  await page.evaluate(() =>
    window.behavior.backup().selectFile(new File(['invalid'], 'backup.json')),
  )
})

Then('the backup is rejected', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.backup().message())).toBe('invalid')
  expect(await page.evaluate(() => window.behavior.resources().learner.confirmation())).toBeNull()
})

When('I request a progress reset', async ({ page }) => {
  await page.evaluate(() => window.behavior.backup().requestReset())
})

Then('reset awaits confirmation', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.resources().learner.confirmation())).toEqual({
    kind: 'reset',
  })
})

When('I cancel the reset', async ({ page }) => {
  await page.evaluate(() => window.behavior.backup().cancel())
})

When('I request and confirm a progress reset', async ({ page }) => {
  await page.evaluate(() => window.behavior.backup().requestReset())

  await page.evaluate(() => window.behavior.backup().confirm())

  expect(await page.evaluate(() => window.behavior.backup().message())).toBe('replaced')
})

When('I try to reuse the previous replacement confirmation', async ({ page }) => {
  const before = await page.evaluate(() => window.behavior.resources().learner.exportBackup())

  await expect(
    page.evaluate(() => window.behavior.resources().learner.confirmReplacement()),
  ).rejects.toThrow('before confirming replacement')
  expect(await page.evaluate(() => window.behavior.resources().learner.exportBackup())).toBe(before)
})
Then('the replacement is refused and saved history is unchanged', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.resources().learner.confirmation())).toBeNull()

  const before = await page.evaluate(() => window.behavior.resources().learner.exportBackup())

  await page.evaluate(() => window.behavior.restart())

  expect(await page.evaluate(() => window.behavior.resources().learner.exportBackup())).toBe(before)
})

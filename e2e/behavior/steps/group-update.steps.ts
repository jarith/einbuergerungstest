import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { createLearnerSnapshot } from '../../../web/src/modules/learner-state/domain/learner-state'
import { decodeLearnerSnapshot } from '../../../web/src/modules/learner-state/infrastructure/snapshot-codec'
import { makePreviousGroupProfile } from '../fixtures/previous-groups'

const { Given, When, Then } = createBdd()

Given(
  'a learner has saved answers and a mock test from the previous question groups',
  async ({ page }) => {
    const now = await page.evaluate(() => Date.now())
    const source = JSON.stringify(makePreviousGroupProfile(now))

    await page.evaluate(async (saved) => {
      window.behavior.state.exported = saved

      await window.behavior.savedProfile(saved)
    }, source)
  },
)

When('I open the app after the question groups change', async ({ page }) => {
  await page.evaluate(() => window.behavior.launch())
})

When('I import my backup from the previous question groups', async ({ page }) => {
  const empty = JSON.stringify(createLearnerSnapshot())

  await page.evaluate(async (saved) => {
    await window.behavior.savedProfile(saved)

    await window.behavior.launch()

    const source = window.behavior.state.exported

    if (source === undefined) {
      throw new Error('Prepare the previous-group profile first.')
    }

    window.behavior.resources().learner.previewImport(source)

    await window.behavior.resources().learner.confirmReplacement()
  }, empty)
})

Then('the original answer history and mock paper are preserved', async ({ page }) => {
  const original = await page.evaluate(() => window.behavior.state.exported)

  if (original === undefined) {
    throw new Error('Prepare the previous-group profile first.')
  }
  const expected = decodeLearnerSnapshot(original)
  const result = await page.evaluate(() => window.behavior.resources().learner())

  expect(result?.studyAttempts).toEqual(expected.studyAttempts)
  expect(result?.mockSittings).toEqual(expected.mockSittings)
  expect(result?.positions).toEqual({
    all: expected.positions.all,
    groups: {
      'europe-eu': expected.positions.groups['europe-eu'],
      berlin: expected.positions.groups['berlin'],
    },
  })
})

import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

Given('a learner has an unsupported saved profile', async ({ page }) => {
  await page.evaluate(() => window.behavior.prepareRejected('unsupported'))
})

Given('a learner has a corrupted saved profile', async ({ page }) => {
  await page.evaluate(() => window.behavior.prepareRejected('corrupted'))
})

Then('the saved profile is rejected without replacement', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.recovery()()?.source)).toBe(
    await page.evaluate(() => window.behavior.state.rejected),
  )
  expect(await page.evaluate(() => window.behavior.state.failure?.message)).toBeTruthy()
})
Then('the original saved profile is unchanged', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.savedProfile())).toBe(
    await page.evaluate(() => window.behavior.state.rejected),
  )
})

When('I recover the original saved data', async ({ page }) => {
  // The integration contract verifies the recoverable source. The recovery E2E verifies download delivery.
  await page.evaluate(() => {
    const source = window.behavior.recovery()()?.source

    if (source === undefined) {
      throw new Error('No rejected profile is available for recovery.')
    }
    window.behavior.state.exported = source
  })
})

Then('the recovered data matches the original saved profile', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.state.exported)).toBe(
    await page.evaluate(() => window.behavior.state.rejected),
  )
})

When('I request a fresh profile', async ({ page }) => {
  await page.evaluate(() => window.behavior.recovery().requestReset())
})

When('I cancel the fresh start', async ({ page }) => {
  await page.evaluate(() => window.behavior.recovery().cancel())

  expect(await page.evaluate(() => window.behavior.recovery().confirmation())).toBeNull()
})

When('I confirm the fresh start', async ({ page }) => {
  await page.evaluate(() => window.behavior.recovery().confirm())

  await page.evaluate(() => window.behavior.state.recoveryRetry)
})

When('another session replaces the rejected profile', async ({ page }) => {
  await page.evaluate(() => window.behavior.savedProfile(window.behavior.replacementProfile))
})

Then('the fresh start is rejected because the saved profile changed', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.recovery().message())).toBe('conflict')
})
Then('the replacement profile is unchanged', async ({ page }) => {
  expect(await page.evaluate(() => window.behavior.savedProfile())).toBe(
    await page.evaluate(() => window.behavior.replacementProfile),
  )
})

Given('the question bank is unavailable', async ({ page }) => {
  await page.route('**/questionbank-berlin.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  )

  await page.evaluate(() => window.behavior.launch())
})

Then('loading can be retried without authorizing a fresh profile', async ({ page }) => {
  const before = await page.evaluate(() => window.behavior.savedProfile())

  expect(await page.evaluate(() => window.behavior.state.failure?.message)).toContain('503')
  expect(await page.evaluate(() => window.behavior.recovery()())).toBeNull()

  await page.evaluate(() => window.behavior.recovery().requestReset())

  expect(await page.evaluate(() => window.behavior.recovery().confirmation())).toBeNull()

  await page.unroute('**/questionbank-berlin.json')

  await page.evaluate(() => window.behavior.launch())

  expect(await page.evaluate(() => window.behavior.savedProfile())).toBe(before)
})

When('another session saves newer preferences', async ({ page }) => {
  await page.evaluate(() => window.behavior.changeElsewhere())
})

When('I select a stale mock answer {string}', async ({ page }, label: string) => {
  if (label !== 'B') {
    throw new Error('This conflict fixture uses answer B.')
  }

  await page.evaluate(() => {
    const first = window.behavior.sitting().answers[0]

    if (!first) {
      throw new Error('Missing answer')
    }

    return window.behavior.resources().mock.select(first.questionKey, 'B')
  })
})

When('I submit the stale mock test', async ({ page }) => {
  await page.evaluate(() => window.behavior.resources().mock.submit())

  await page.evaluate(() => window.behavior.resources().mock.confirmSubmission())
})

When('I try to change the stale review translation', async ({ page }) => {
  await page.evaluate(() => window.behavior.review().setTranslation(true))
})

Then('the stale change is rejected', async ({ page }) => {
  const result = await page.evaluate(() => ({
    mock: window.behavior.resources().mock.error()?.name,
    review: window.behavior.state.review?.error(),
  }))

  expect(result.mock === 'LearnerStateConflictError' || result.review === 'storageConflict').toBe(
    true,
  )
})
Then('the review translation remains disabled', async ({ page }) => {
  expect(
    await page.evaluate(() => window.behavior.resources().localization.translation().enabled),
  ).toBe(false)
})
Then('the newer appearance preference is preserved', async ({ page }) => {
  expect(
    await page.evaluate(() => window.behavior.resources().learner()?.preferences.appearance),
  ).toBe('dark')
})

When('I try to reuse the completed fresh-start confirmation', async ({ page }) => {
  const before = await page.evaluate(() => window.behavior.savedProfile())

  await page.evaluate(() => window.behavior.recovery().confirm())

  expect(await page.evaluate(() => window.behavior.savedProfile())).toBe(before)
})

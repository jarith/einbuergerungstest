import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { openNavigation } from '../support/browser'

export const expectViewportFit = async (page: Page) => {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true)
}

export const chooseLanguage = async (page: Page, language: 'English' | 'Deutsch') => {
  await openNavigation(page, '/settings')

  await page
    .getByRole('radiogroup', { name: /^(Interface language|Sprache der Benutzeroberfläche)$/ })
    .getByText(language, { exact: true })
    .click()

  await expect(page.getByRole('radio', { name: language, exact: true })).toBeChecked()

  await openNavigation(page, '/dashboard')
}

export const waitForAppReady = async (page: Page) => {
  // Browser visits have no offline preparation phase. Wait for the loaded shell.
  await expect(page.getByRole('navigation')).toBeVisible()
}

export const startMock = async (page: Page) => {
  await waitForAppReady(page)

  await page.getByRole('link', { name: /^(Start mock test|Probetest starten)$/ }).click()

  await page.getByRole('button', { name: /^(Start mock test|Probetest starten)$/ }).click()

  await expect(page.getByRole('timer')).toBeVisible()
}

export const tabTo = async (page: Page, target: Locator) => {
  // macOS WebKit uses Option-Tab for buttons under its default keyboard-navigation settings.
  // https://support.apple.com/en-gb/guide/safari/cpsh003/mac
  const key =
    process.platform === 'darwin' && page.context().browser()?.browserType().name() === 'webkit'
      ? 'Alt+Tab'
      : 'Tab'

  // A bounded keyboard traversal proves reachability without programmatically focusing the target.
  // oxlint-disable-next-line app/prefer-array-methods
  for (let step = 0; step < 40; step += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return
    }

    await page.keyboard.press(key)
  }

  await expect(target).toBeFocused()
}

export const bounds = async (locator: Locator) => {
  await expect(locator).toBeVisible()

  return await locator.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect()

    return { x, y, width, height }
  })
}

export const expectReadable = async (elements: Locator) => {
  await expect(elements.first()).toBeVisible()

  for (const element of await elements.all()) {
    await expect(element).toBeVisible()

    await expect
      .poll(() =>
        element.evaluate(
          (node) =>
            node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1,
        ),
      )
      .toBe(true)
  }
}

export const expectReachableAboveNavigation = async (page: Page, target: Locator) => {
  await target.scrollIntoViewIfNeeded()

  await expect
    .poll(async () => {
      const control = await bounds(target)
      const navigation = await bounds(page.getByRole('navigation'))

      return control.y >= 0 && control.y + control.height <= navigation.y
    })
    .toBe(true)

  await target.click({ trial: true })
}

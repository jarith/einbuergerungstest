import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const themes = [
  { colorScheme: 'light', skin: 'baseline', accent: 'rgb(33, 90, 171)', height: '44px' },
  { colorScheme: 'dark', skin: 'baseline', accent: 'rgb(150, 191, 255)', height: '44px' },
  { colorScheme: 'light', skin: 'alternate', accent: 'rgb(84, 53, 173)', height: '48px' },
  { colorScheme: 'dark', skin: 'alternate', accent: 'rgb(200, 182, 255)', height: '48px' },
] as const

for (const { colorScheme, skin, accent, height } of themes) {
  test.describe(`${skin} / ${colorScheme}`, () => {
    const globals = `colorScheme:${colorScheme};skin:${skin}`

    test('composition loads styled, keyboard-accessible controls', async ({ page }) => {
      await page.goto(`/iframe.html?id=foundation-components--composition&globals=${globals}`)

      const panel = page.getByRole('region', { name: 'Project settings' })
      const input = panel.getByRole('textbox', { name: 'Project name' })
      const button = panel.getByRole('button', { name: 'Save project' })

      await expect(panel).toBeVisible()
      await expect(input).toHaveValue('My next app')
      await expect(input).toHaveAccessibleDescription('Choose a name for your next idea.')
      await expect(input).toHaveCSS('height', height)
      await expect(button).toHaveCSS('min-height', height)
      await expect(button).toHaveCSS('background-color', accent)

      await input.focus()

      await input.fill('Updated project')

      await page.keyboard.press('Tab')

      await expect(button).toBeFocused()
      await expect(input).toHaveValue('Updated project')

      const accessibility = await new AxeBuilder({ page }).include('#storybook-root').analyze()

      expect(accessibility.violations).toEqual([])
    })

    test('invalid input exposes its error', async ({ page }) => {
      await page.goto(`/iframe.html?id=components-textinput--invalid&globals=${globals}`)

      const input = page.getByRole('textbox', { name: 'Project name' })

      await expect(input).toHaveAttribute('aria-invalid', 'true')
      await expect(input).toHaveAccessibleDescription(/Enter a project name\./)
      await expect(page.getByText('Enter a project name.', { exact: true })).toBeVisible()
    })
  })
}

for (const state of ['disabled', 'loading']) {
  test(`${state} button cannot be activated`, async ({ page }) => {
    await page.goto(`/iframe.html?id=components-button--${state}`)

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
}

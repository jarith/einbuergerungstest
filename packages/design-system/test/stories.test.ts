import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const themes = [
  {
    colorScheme: 'light',
    skin: 'baseline',
    accent: 'rgb(63, 91, 23)',
    actionHeight: '48px',
    fieldHeight: '44px',
  },
  {
    colorScheme: 'dark',
    skin: 'baseline',
    accent: 'rgb(167, 192, 128)',
    actionHeight: '48px',
    fieldHeight: '44px',
  },
  {
    colorScheme: 'light',
    skin: 'alternate',
    accent: 'rgb(84, 53, 173)',
    actionHeight: '48px',
    fieldHeight: '48px',
  },
  {
    colorScheme: 'dark',
    skin: 'alternate',
    accent: 'rgb(200, 182, 255)',
    actionHeight: '48px',
    fieldHeight: '48px',
  },
] as const

for (const { colorScheme, skin, accent, actionHeight, fieldHeight } of themes) {
  test.describe(`${skin} / ${colorScheme}`, () => {
    const globals = `colorScheme:${colorScheme};skin:${skin}`

    test('public JSX patterns emit themed layout styles', async ({ page }) => {
      await page.goto(`/iframe.html?id=foundation-layout--composition&globals=${globals}`)

      const composition = page.getByRole('region', { name: 'Layout composition' })
      const actions = page.getByRole('toolbar', { name: 'Actions' })

      await expect(composition).toHaveCSS('display', 'flex')
      await expect(composition).toHaveCSS('flex-direction', 'column')
      await expect(composition).toHaveCSS('gap', '20px')
      await expect(actions).toHaveCSS('display', 'flex')
      await expect(actions).toHaveCSS('flex-wrap', 'wrap')
      await expect(actions.getByRole('button')).toHaveCount(3)
    })

    test('composition loads styled, keyboard-accessible controls', async ({ page }) => {
      await page.goto(`/iframe.html?id=foundation-components--composition&globals=${globals}`)

      const panel = page.getByRole('region', { name: 'Project settings' })
      const input = panel.getByRole('textbox', { name: 'Project name' })
      const button = panel.getByRole('button', { name: 'Save project' })

      await expect(panel).toBeVisible()
      await expect(input).toHaveValue('My next app')
      await expect(input).toHaveAccessibleDescription('Choose a name for your next idea.')
      await expect(input).toHaveCSS('height', fieldHeight)
      await expect(button).toHaveCSS('min-height', actionHeight)
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

for (const colorScheme of ['light', 'dark']) {
  test(`${colorScheme} study choices expose selection and feedback`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=foundation-components--study-question&globals=colorScheme:${colorScheme}`,
    )

    const answers = page.getByRole('radio')

    await expect(answers).toHaveCount(4)
    await expect(answers.nth(0)).toHaveAttribute('aria-checked', 'true')

    await answers.nth(0).press('ArrowDown')

    await expect(answers.nth(1)).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByText('Correct', { exact: true })).toBeVisible()

    const accessibility = await new AxeBuilder({ page }).include('#storybook-root').analyze()

    expect(accessibility.violations).toEqual([])
  })
}

for (const { colorScheme, incorrect, correct } of [
  {
    colorScheme: 'light',
    incorrect: { background: 'rgb(246, 212, 208)', border: 'rgb(158, 52, 66)' },
    correct: { background: 'rgb(212, 226, 179)', border: 'rgb(63, 91, 23)' },
  },
  {
    colorScheme: 'dark',
    incorrect: { background: 'rgb(77, 38, 39)', border: 'rgb(237, 160, 161)' },
    correct: { background: 'rgb(46, 61, 26)', border: 'rgb(167, 192, 128)' },
  },
]) {
  test(`${colorScheme} answer feedback keeps its colors when selected and hovered`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=components-choicegroup--feedback&globals=colorScheme:${colorScheme}`,
    )

    for (const { marker, result, background, border } of [
      { marker: 'A', result: 'Incorrect', ...incorrect },
      { marker: 'D', result: 'Correct', ...correct },
    ]) {
      const answer = page.getByRole('radio', { name: new RegExp(`^${marker}\\b`) })

      await expect(answer).toContainText(result)
      await expect(answer).toHaveCSS('background-color', background)
      await expect(answer).toHaveCSS('border-color', border)

      await answer.hover()

      await expect(answer).toHaveCSS('background-color', background)
      await expect(answer).toHaveCSS('border-color', border)

      await answer.click()

      await expect(answer).toBeChecked()
      await expect(answer).toHaveCSS('background-color', background)
      await expect(answer).toHaveCSS('border-color', border)
    }
  })
}

test('compact filter choices remain keyboard operable', async ({ page }) => {
  await page.goto('/iframe.html?id=components-segmentedchoice--filters')

  const incorrect = page.getByRole('radio', { name: 'Incorrect' })

  await page.getByText('Incorrect', { exact: true }).click()

  await expect(incorrect).toBeChecked()

  await incorrect.focus()

  await incorrect.press('ArrowRight')

  await expect(page.getByRole('radio', { name: 'Untried' })).toBeChecked()
})

test('confirmation dialog traps focus and restores it on Escape', async ({ page }) => {
  await page.goto('/iframe.html?id=components-dialog--confirmation')

  const trigger = page.getByRole('button', { name: 'Submit test' })

  await trigger.click()

  await expect(page.getByRole('dialog', { name: 'Submit the mock test?' })).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

for (const state of ['disabled', 'loading']) {
  test(`${state} button cannot be activated`, async ({ page }) => {
    await page.goto(`/iframe.html?id=components-button--${state}`)

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
}

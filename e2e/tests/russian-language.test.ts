import { expect, test } from '@playwright/test'

test('selecting Russian localizes settings, navigation, groups, and the calendar', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-09-26T12:00:00Z') })

  await page.goto('/settings')

  await page
    .getByRole('radiogroup', { name: 'Interface language' })
    .getByText('Русский', { exact: true })
    .click()

  await expect(page.getByRole('heading', { name: 'Настройки и резервная копия' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Русский', exact: true })).toBeChecked()
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Обучение', exact: true }),
  ).toBeVisible()

  await page.getByLabel('Планируемая дата теста', { exact: true }).click()

  await expect(page.getByRole('button', { name: 'Следующий месяц', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '26 сентября 2026', exact: true })).toBeEnabled()

  await page.keyboard.press('Escape')

  await page.getByRole('navigation').getByRole('link', { name: 'Главная', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Основные права', exact: true })).toBeVisible()
  await expect(
    page.getByText(
      'Основной закон, достоинство человека, свобода выражения мнений и вероисповедания, равноправие, неприкосновенность частной жизни и защита конституции.',
      { exact: true },
    ),
  ).toBeVisible()
})

test('Russian study translation toggles and remains selected after reload', async ({ page }) => {
  await page.goto('/settings')

  await page
    .getByRole('radiogroup', { name: 'Interface language' })
    .getByText('Русский', { exact: true })
    .click()

  await page.getByRole('navigation').getByRole('link', { name: 'Обучение', exact: true }).click()

  const toggle = page.getByRole('button', { name: 'Показать русский перевод', exact: true })

  const translated = page.getByText(
    'В Германии люди могут открыто критиковать правительство, потому что …',
    { exact: true },
  )

  await toggle.click()

  await expect(translated).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …',
      exact: true,
    }),
  ).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')

  await page.reload()

  await expect(translated).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')

  await toggle.click()

  await expect(translated).not.toBeVisible()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
})

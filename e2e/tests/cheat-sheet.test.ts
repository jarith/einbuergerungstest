import { expect, test } from '@playwright/test'

import { expectViewportFit } from './helpers'

// Browser UI/platform checks against the design and the supplied notes, with real app state.
test('cheat sheet groups open independently and close with heading focus @webkit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })

  await page.goto('/cheat-sheet')

  const rights = page.getByRole('button', { name: '01 Fundamental rights', exact: true })
  const state = page.getByRole('button', { name: '02 Structure of the state', exact: true })
  const expectedGroups = 14

  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(expectedGroups)
  await expect(rights).toHaveAttribute('aria-expanded', 'false')
  await expect(state).toHaveAttribute('aria-expanded', 'false')

  await rights.focus()

  await page.keyboard.press('Enter')

  await state.click()

  await expect(rights).toHaveAttribute('aria-expanded', 'true')
  await expect(state).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByText('Meinungsfreiheit', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Parlament und Regierung (Parliament and government):', { exact: true }),
  ).toBeVisible()

  await expectViewportFit(page)

  await page
    .getByRole('region', { name: '01 Fundamental rights', exact: true })
    .getByRole('button', { name: 'Close group', exact: true })
    .click()

  await expect(rights).toHaveAttribute('aria-expanded', 'false')
  await expect(rights).toBeFocused()
  await expect(state).toHaveAttribute('aria-expanded', 'true')
})

test('saved German language updates the notes while retaining open groups', async ({ page }) => {
  await page.goto('/cheat-sheet')

  await page.getByRole('button', { name: '01 Fundamental rights', exact: true }).click()

  await page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click()

  await page
    .getByRole('radiogroup', { name: 'Interface language' })
    .getByText('Deutsch', { exact: true })
    .click()

  await page.getByRole('navigation').getByRole('link', { name: 'Spickzettel', exact: true }).click()

  await expect(page.getByRole('button', { name: '01 Grundrechte', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(page.getByText('Meinungsfreiheit', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Gruppe schließen', exact: true })).toBeVisible()
  await expect(page.getByText('All 14 groups · English', { exact: true })).toHaveCount(0)

  await page.reload()

  await page.getByRole('button', { name: '14 Berlin', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Spickzettel', exact: true })).toBeVisible()
  await expect(
    page.getByText('Regierende Bürgermeister / die Regierende Bürgermeisterin', { exact: true }),
  ).toBeVisible()
})

test('saved Russian language renders the supplied notes and downloads the Russian PDF', async ({
  page,
}) => {
  await page.goto('/settings')

  await page
    .getByRole('radiogroup', { name: 'Interface language' })
    .getByText('Русский', { exact: true })
    .click()

  await page.getByRole('navigation').getByRole('link', { name: 'Шпаргалка', exact: true }).click()

  await page.getByRole('button', { name: '01 Основные права', exact: true }).click()

  await expect(
    page.getByText(
      '(свобода выражения мнения) - можно открыто критиковать die Regierung (правительство). Можно высказывать своё мнение в интернете.',
      { exact: false },
    ),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Закрыть группу', exact: true })).toBeVisible()

  const downloadEvent = page.waitForEvent('download')

  await page.getByRole('button', { name: 'Скачать PDF', exact: true }).click()

  const download = await downloadEvent

  expect(download.suggestedFilename()).toBe('einbuergerungstest-berlin-cheat-sheet-ru.pdf')
  expect(await download.failure()).toBeNull()
  await expect(page.getByRole('status')).toContainText('PDF готов.')
})

test('prepared installed app opens an unvisited cheat sheet and downloads offline', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }))

  await page.goto('/pwa/dashboard')

  await expect(
    page.getByRole('contentinfo').getByText('Ready offline', { exact: true }),
  ).toBeVisible()

  await context.setOffline(true)

  await page.goto('/pwa/cheat-sheet')

  await page.getByRole('button', { name: '14 Berlin', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Cheat sheet', exact: true })).toBeVisible()
  await expect(
    page.getByText('Regierender Bürgermeister / Regierende Bürgermeisterin', { exact: true }),
  ).toBeVisible()

  const downloadEvent = page.waitForEvent('download')

  await page.getByRole('button', { name: 'Download PDF', exact: true }).click()

  const download = await downloadEvent

  expect(download.suggestedFilename()).toBe('einbuergerungstest-berlin-cheat-sheet-en.pdf')
  expect(await download.failure()).toBeNull()

  await page.reload()

  await page.getByRole('button', { name: '01 Fundamental rights', exact: true }).click()

  await expect(page.getByText('Meinungsfreiheit', { exact: true })).toBeVisible()
})

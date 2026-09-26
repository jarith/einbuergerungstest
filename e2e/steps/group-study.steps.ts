import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import questionBank from '../../resources/bamf-einbuergerungstest-berlin.json' with { type: 'json' }
import { sourceQuestion, sourceQuestionOnPage, studyAnswer } from './helpers'

const { When, Then } = createBdd()

const notedMockGroup = new WeakMap<Page, string>()

const groupByTitle = (title: string) => {
  const group = questionBank.groups.find((candidate) => candidate.title === title)

  if (!group) {
    throw new Error(`Unknown question group: ${title}`)
  }

  return group
}

const groupCount = (id: string) =>
  questionBank.questions.filter((question) => question.group_id === id).length

const groupProgress = (page: Page, title: string) =>
  page.getByRole('region', { name: title, exact: true })

const expectGroupProgress = async (
  page: Page,
  title: string,
  solved: number,
  total: number,
  percent: number,
) => {
  const progress = groupProgress(page, title)

  await expect(progress).toBeVisible()
  await expect(progress).toContainText(new RegExp(`\\b${solved}\\s*/\\s*${total}\\b`))
  await expect(progress).toContainText(new RegExp(`\\b${percent}\\s*%`))
}

When('I open group study', async ({ page }) => {
  await page
    .getByRole('button', {
      name: /^(Study by group|Study groups|Learn by topic|Gruppen lernen|Nach Themen lernen)$/,
    })
    .click()
})

Then(
  'the group picker lists every question group with its description and question count',
  async ({ page }) => {
    for (const group of questionBank.groups) {
      const option = page.getByRole('button', { name: new RegExp(group.title, 'i') })

      await expect(option).toBeVisible()
      await expect(option).toContainText(group.description)
      await expect(option).toContainText(new RegExp(`\\b${groupCount(group.id)}\\b`))
    }
  },
)

When('I choose the {string} group', async ({ page }, title: string) => {
  groupByTitle(title)

  await page.getByRole('button', { name: new RegExp(title, 'i') }).click()
})

Then('source question {int} is shown in group study', async ({ page }, number: number) => {
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    sourceQuestion(number).question_de,
  )
})

When('I answer and advance through the Berlin group to its final question', async ({ page }) => {
  for (let number = 301; number < 310; number += 1) {
    const question = sourceQuestion(number)

    await expect(page.getByRole('heading', { level: 2 })).toHaveText(question.question_de)

    await studyAnswer(page, question.correct_option).click()

    await page.getByRole('button', { name: /^(Next|Weiter)$/ }).click()
  }
})

When('I finish the group', async ({ page }) => {
  await page
    .getByRole('button', { name: /^(Next|Weiter|Finish group|Gruppe abschließen)$/ })
    .click()
})

Then('group study shows completion without another question', async ({ page }) => {
  await expect(page.getByRole('main')).toContainText(
    /group (?:complete|finished)|Gruppe abgeschlossen/i,
  )
  await expect(page.getByText(sourceQuestion(310).question_de, { exact: true })).toHaveCount(0)
})

Then('the dashboard shows zero progress for every question group', async ({ page }) => {
  for (const group of questionBank.groups) {
    await expectGroupProgress(page, group.title, 0, groupCount(group.id), 0)
  }
})

Then(
  'the {string} group shows {int} of {int} solved and {int} percent',
  async ({ page }, title: string, solved: number, total: number, percent: number) => {
    const group = groupByTitle(title)

    expect(groupCount(group.id)).toBe(total)

    await expectGroupProgress(page, title, solved, total, percent)
  },
)

When("I note the first mock question's group", async ({ page }) => {
  const question = await sourceQuestionOnPage(page)

  notedMockGroup.set(page, question.group_id)
})

Then("the noted mock question's group shows one solved question", async ({ page }) => {
  const groupId = notedMockGroup.get(page)
  const group = questionBank.groups.find((candidate) => candidate.id === groupId)

  if (!group) {
    throw new Error('No mock question group was noted in this scenario.')
  }

  const total = groupCount(group.id)

  await expectGroupProgress(page, group.title, 1, total, Math.round(100 / total))
})

Then('the Constitution and rights group has a German title and description', async ({ page }) => {
  const englishGroup = groupByTitle('Constitution, rights, and democratic principles')

  await expect(page.getByRole('main')).toContainText(/Verfassung|Grundrechte/)
  await expect(page.getByRole('main')).toContainText(/Grundgesetz|Freiheiten/)
  await expect(page.getByText(englishGroup.title, { exact: true })).toHaveCount(0)
  await expect(page.getByText(englishGroup.description, { exact: true })).toHaveCount(0)
})

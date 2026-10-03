import { computed } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'

export const createStudyGroupsModel = (resources: AppResources) => {
  const { learner, localization, questions } = resources

  return computed(() => {
    const progress = learner.progress.groups()
    const positions = learner()?.positions.groups

    return questions.bank.groups.map((group, index) => {
      const total = progress.get(group.id)

      if (total === undefined) {
        throw new Error(`Missing progress for question group ${group.id}.`)
      }
      const position = positions?.[group.id]

      return {
        ...localization.getGroup(group),
        ...total,
        number: localization.formatNumber(index + 1, { minimumIntegerDigits: 2 }),
        position,
        href: `/study/groups/${encodeURIComponent(group.id)}`,
        action:
          position === undefined
            ? 'groups.start'
            : position.status === 'completed'
              ? 'groups.completed'
              : 'groups.continue',
      } as const
    })
  }, 'studyGroups').extend(() => ({
    localization,
    questionCount: questions.bank.question_count,
  }))
}

export type StudyGroupsModel = ReturnType<typeof createStudyGroupsModel>

export type StudyGroupItem = ReturnType<StudyGroupsModel>[number]

export type StudyGroupsData = AppResources & Readonly<{ groups: StudyGroupsModel }>

import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { pageNotFound, RoutePage } from '../../app/routing'
import { getQuestionKey } from '../../modules/question-bank'
import { StudyPage } from './components/study-page/study-page'

export const createStudyRoutes = (parent: AppRoute) => {
  const load = async (questionKey: string | undefined, groupId?: string) => {
    const resources = await wrap(parent.loader())
    const { questions, learner } = resources
    const group = questions.bank.groups.find((item) => item.id === groupId)

    if (groupId !== undefined && group === undefined) {
      throw pageNotFound()
    }

    const ordered = questions.bank.questions.filter(
      (question) => groupId === undefined || question.group_id === groupId,
    )

    const position =
      groupId === undefined ? learner()?.positions.all : learner()?.positions.groups[groupId]

    const first = ordered[0]

    if (first === undefined) {
      throw pageNotFound()
    }

    const selected = questions.getQuestion(
      questionKey ?? position?.questionKey ?? getQuestionKey(first),
    )

    if (
      selected === undefined ||
      (groupId !== undefined && selected.question.group_id !== groupId)
    ) {
      throw pageNotFound()
    }

    return { ...resources, selected, group, ordered }
  }

  const study = parent.reatomRoute(
    {
      path: 'study/:questionKey',
      params: (params) => (params.questionKey === 'groups' ? null : params),
      loader: async ({ questionKey }) => await wrap(load(questionKey)),
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={StudyPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'studyQuestionRoute',
  )

  const groupStudy = parent.reatomRoute(
    {
      path: 'study/groups/:groupId/:questionKey',
      loader: async ({ groupId, questionKey }) => await wrap(load(questionKey, groupId)),
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={StudyPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'groupStudyQuestionRoute',
  )

  const entry = parent.reatomRoute(
    {
      path: 'study',
      loader: async () => {
        const isEntry = entry.exact()
        const data = await wrap(load(undefined))

        if (isEntry) {
          study.go({ questionKey: data.selected.key }, true)
        }

        return data
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={StudyPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'studyEntryRoute',
  )

  const groupEntry = parent.reatomRoute(
    {
      path: 'study/groups/:groupId',
      loader: async ({ groupId }) => {
        const isEntry = groupEntry.exact()
        const data = await wrap(load(undefined, groupId))

        if (isEntry) {
          groupStudy.go({ groupId, questionKey: data.selected.key }, true)
        }

        return data
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={StudyPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'groupStudyEntryRoute',
  )

  return { entry, study, groupEntry, groupStudy }
}

export type StudyData = Awaited<ReturnType<ReturnType<typeof createStudyRoutes>['study']['loader']>>

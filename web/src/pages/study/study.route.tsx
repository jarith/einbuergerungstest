import type { ReactElement } from 'react'
import { wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import type { StudyMode } from '../../modules/learner-state'
import { pageNotFound, RoutePage } from '../../app/routing'
import { getQuestionKey } from '../../modules/question-bank'
import { StudyPage } from './components/study-page/study-page'
import { createStudyModel } from './study.model'

type StudySearchInput = Readonly<{ mode?: string }>

type StudySearch = Readonly<{ mode: StudyMode }>

export const createStudyRoutes = (parent: AppRoute) => {
  const load = async (
    questionKey: string | undefined,
    groupId?: string,
    mode: StudyMode = 'inspection',
  ) => {
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

    return {
      ...resources,
      selected,
      group,
      ordered,
      model:
        groupId === undefined
          ? createStudyModel(resources, selected.key, mode, (key) => {
              const current = study()

              if (study.exact() && current?.questionKey === selected.key && current.mode === mode) {
                study.go({ questionKey: key, mode })
              }
            })
          : createStudyModel(
              resources,
              selected.key,
              'sequential',
              (key) => {
                const current = groupStudy()

                if (
                  groupStudy.exact() &&
                  current?.questionKey === selected.key &&
                  current.groupId === groupId
                ) {
                  groupStudy.go({ groupId, questionKey: key })
                }
              },
              groupId,
            ),
    }
  }

  const study = parent.reatomRoute(
    {
      path: 'study/:questionKey',
      params: (params) => (params.questionKey === 'groups' ? null : params),
      search: {
        decode: (input: StudySearchInput): StudySearch => {
          if (
            input.mode !== undefined &&
            input.mode !== 'sequential' &&
            input.mode !== 'inspection'
          ) {
            throw pageNotFound()
          }

          return { mode: input.mode ?? 'inspection' }
        },
        encode: ({ mode }: StudySearch): StudySearchInput =>
          mode === 'sequential' ? { mode } : {},
      },
      loader: async ({ questionKey, mode }) => await wrap(load(questionKey, undefined, mode)),
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
        const data = await wrap(load(undefined, undefined, 'sequential'))

        if (isEntry) {
          study.go({ questionKey: data.selected.key, mode: 'sequential' }, true)
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
          if (data.learner()?.positions.groups[groupId] === undefined) {
            await wrap(
              data.learner.setStudyPosition(groupId, {
                questionKey: data.selected.key,
                status: 'in-progress',
              }),
            )
          }

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

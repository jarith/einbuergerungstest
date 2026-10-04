import { action, atom, computed, withActions, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { StudyMode } from '../../modules/learner-state'
import type { QuestionKey } from '../../modules/question-bank'
import { createOrderedStudy, createStudySession } from '../../modules/learner-state'

export const createStudySessionScope = () =>
  atom({ answers: createStudySession() }, 'study.session').extend(
    withActions((scope) => ({ start: () => scope.set({ answers: createStudySession() }) })),
  )

export const createStudyModel = (
  resources: AppResources,
  target: QuestionKey,
  mode: StudyMode,
  navigate: (key: QuestionKey) => void,
  groupId: string | null = null,
  session: ReturnType<typeof createStudySession> = createStudySession(),
) => {
  const flow = createOrderedStudy(
    resources.questions.bank,
    resources.learner,
    target,
    mode,
    groupId,
    session,
  )

  const group = resources.questions.bank.groups.find((item) => item.id === groupId)

  return computed(() => {
    const current = flow()
    const loaded = resources.questions.getQuestion(current.key)

    if (loaded === undefined) {
      throw new Error('This study question could not be loaded.')
    }

    return { ...current, loaded }
  }, 'study.scope').extend(() => ({
    flow,
    status: computed(
      () => resources.learner.progress.questions().get(flow().key)?.status ?? 'not-started',
      'study.status',
    ),
    totals: computed(() => {
      if (groupId === null) {
        return resources.learner.progress.totals()
      }
      const total = resources.learner.progress.groups().get(groupId)

      if (total === undefined) {
        throw new Error('This study group has no progress summary.')
      }

      return total
    }, 'study.totals'),
    previous: action(async () => {
      await wrap(flow.previous())

      if (flow.error() === null && flow().key !== target) {
        navigate(flow().key)
      }
    }, 'study.previous').extend(withAsync()),
    next: action(async () => {
      await wrap(flow.next())

      if (flow.error() === null && !flow().isCompleted && flow().key !== target) {
        navigate(flow().key)
      }
    }, 'study.next').extend(withAsync()),
    restart: action(async () => {
      await wrap(flow.restart())

      if (flow.error() === null && flow().key !== target) {
        navigate(flow().key)
      }
    }, 'study.restart').extend(withAsync()),
    localization: resources.localization,
    translation: resources.localization.translation,
    scope: computed(
      () =>
        group === undefined
          ? resources.localization.t()('study.allQuestions')
          : resources.localization.getGroup(group).title,
      'study.scopeLabel',
    ),
    completion: computed(
      () =>
        resources.localization.t()(
          group === undefined ? 'study.allComplete' : 'study.groupComplete',
        ),
      'study.completion',
    ),
    isGroup: group !== undefined,
    exitPath: '/dashboard',
  }))
}

export type StudyModel = ReturnType<typeof createStudyModel>

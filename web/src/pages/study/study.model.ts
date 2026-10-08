import { action, atom, computed, withActions, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { StudyMode } from '../../modules/learner-state'
import type { QuestionKey } from '../../modules/question-bank'
import { getAppPath } from '../../app/offline/app-mode'
import { createOrderedStudy, createStudySession } from '../../modules/learner-state'
import { createQuestionMotion, createQuestionSession } from '../../modules/question-session'

export const createStudySessionScope = () =>
  atom({ answers: createStudySession() }, 'study.session').extend(
    () => ({ motion: createQuestionMotion() }),
    withActions((scope) => ({
      start: () => {
        scope.motion.clear()

        scope.set({ answers: createStudySession() })
      },
    })),
  )

export const createStudyModel = (
  resources: AppResources,
  target: QuestionKey,
  mode: StudyMode,
  navigate: (key: QuestionKey) => void,
  groupId: string | null = null,
  session: ReturnType<typeof createStudySession> = createStudySession(),
  motion = createQuestionMotion(),
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
    isCompleted: computed(() => flow().isCompleted, 'study.isCompleted'),
    session,
    questions: createQuestionSession(
      {
        current: () => ({
          key: flow().key,
          index: flow().index,
          total: flow().total,
          isPending: flow.pending(),
          canAnswer: !flow().isCompleted && flow().selectedOption === null,
          canFinish: true,
        }),
        answer: (option) => flow.answer(option),
        navigate: async (index) => {
          const before = flow()

          await wrap(index < before.index ? flow.previous() : flow.next())

          if (flow.error() !== null) {
            return false
          }

          if (!flow().isCompleted && flow().key !== target) {
            navigate(flow().key)
          }

          return flow().key !== before.key
        },
      },
      motion,
    ),
    shouldAnimateCompletion: !flow().isCompleted,
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
    restart: action(async () => {
      motion.clear()

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
    exitPath: getAppPath('/dashboard'),
  }))
}

export type StudyModel = ReturnType<typeof createStudyModel>

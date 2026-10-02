import { action, computed, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { StudyMode } from '../../modules/learner-state'
import type { QuestionKey } from '../../modules/question-bank'
import { createOrderedStudy } from '../../modules/learner-state'

export const createStudyModel = (
  resources: AppResources,
  target: QuestionKey,
  mode: StudyMode,
  navigate: (key: QuestionKey) => void,
) => {
  const flow = createOrderedStudy(resources.questions.bank, resources.learner, target, mode)

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
    totals: resources.learner.progress.totals,
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
    scope: computed(() => resources.localization.t()('study.allQuestions'), 'study.scopeLabel'),
    completion: computed(() => resources.localization.t()('study.allComplete'), 'study.completion'),
    exitPath: '/',
  }))
}

export type StudyModel = ReturnType<typeof createStudyModel>

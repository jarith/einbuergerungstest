import { action, computed, urlAtom, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { QuestionKey } from '../../modules/question-bank'
import { createOrderedStudy } from '../../modules/learner-state'

export const createStudyModel = (resources: AppResources, target?: QuestionKey) => {
  const flow = createOrderedStudy(resources.questions.bank, resources.learner, target)

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

      if (target !== undefined && flow.error() === null) {
        urlAtom.go(`/study/${encodeURIComponent(flow().key)}`, true)
      }
    }, 'study.previous').extend(withAsync()),
    next: action(async () => {
      await wrap(flow.next())

      if (target !== undefined && flow.error() === null && !flow().isCompleted) {
        urlAtom.go(`/study/${encodeURIComponent(flow().key)}`, true)
      }
    }, 'study.next').extend(withAsync()),
    localization: resources.localization,
    translation: resources.localization.translation,
    scope: computed(() => resources.localization.t()('study.allQuestions'), 'study.scopeLabel'),
    completion: computed(() => resources.localization.t()('study.allComplete'), 'study.completion'),
    exitPath: '/',
  }))
}

export type StudyModel = ReturnType<typeof createStudyModel>

import { computed } from '@reatom/core'

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
    localization: resources.localization,
    translation: resources.localization.translation,
    scope: computed(() => resources.localization.t()('study.allQuestions'), 'study.scopeLabel'),
    completion: computed(() => resources.localization.t()('study.allComplete'), 'study.completion'),
    exitPath: '/',
  }))
}

export type StudyModel = ReturnType<typeof createStudyModel>

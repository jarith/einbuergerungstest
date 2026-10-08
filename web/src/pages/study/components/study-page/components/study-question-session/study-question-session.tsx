import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { StudySessionProps } from '../study-session/study-session'
import { QuestionStatusBadge } from '../../../../../../modules/learner-state'
import { QuestionSession } from '../../../../../../modules/question-session'

export const StudyQuestionSession = reatomComponent(({ model }: StudySessionProps) => {
  const current = model()
  const t = model.localization.t()

  return (
    <QuestionSession
      model={model.questions}
      interaction={{
        mode: 'study',
        hasJustLearned: current.hasJustLearned,
        shouldAnnounceFeedback: model.flow.shouldAnnounceFeedback,
      }}
      question={{
        status: <QuestionStatusBadge status={model.status()} t={t} />,
        loaded: current.loaded,
        selectedOption: current.selectedOption,
        language: model.localization.language(),
        translationEnabled: model.translation().enabled,
        onTranslationChange: wrap((enabled) => {
          void model.flow.setTranslation(enabled)
        }),
        t,
      }}
    />
  )
}, 'StudyQuestionSession')

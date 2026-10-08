import { reatomComponent } from '@reatom/react'

import type { MockPageModel } from '../../../../mock-test.model'
import { QuestionSession } from '../../../../../../modules/question-session'

type MockQuestionProps = Readonly<{ model: MockPageModel }>

export const MockQuestion = reatomComponent(({ model }: MockQuestionProps) => {
  const { loaded, answer } = model()
  const t = model.localization.t()

  if (loaded === undefined || answer === undefined) {
    return null
  }

  return (
    <QuestionSession
      model={model.questions}
      interaction={{ mode: 'live-mock' }}
      question={{
        loaded,
        selectedOption: answer.selectedOption,
        language: model.localization.language(),
        translationEnabled: false,
        onTranslationChange: () => undefined,
        t,
      }}
    />
  )
}, 'MockQuestion')

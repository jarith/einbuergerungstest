import { computed } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { LoadedQuestion } from '../../modules/question-bank'
import { getAppPath } from '../../app/offline/app-mode'

export const createQuestionHistoryModel = (resources: AppResources, selected: LoadedQuestion) => {
  const correctOption = selected.question.answer_options.find(
    (option) => option.label === selected.question.correct_option,
  )

  return computed(() => {
    const progress = resources.learner.progress.questions().get(selected.key)

    if (progress === undefined || correctOption === undefined) {
      throw new Error('This question is no longer available. Return to the question list.')
    }

    return { progress, correctOption, earlier: progress.attempts.slice(0, -1).toReversed() }
  }, 'questionHistory').extend(() => ({
    selected,
    localization: resources.localization,
    studyPath: getAppPath(`/study/${encodeURIComponent(selected.key)}`),
    listPath: getAppPath('/progress'),
    getOption: (label: string) =>
      selected.question.answer_options.find((option) => option.label === label),
  }))
}

export type QuestionHistoryModel = ReturnType<typeof createQuestionHistoryModel>

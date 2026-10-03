import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import { isLearnerStateConflict } from '../../modules/learner-state'
import { getMockFinishReason } from '../../modules/mock-test'
import { getAnswerFeedback } from '../../modules/question-bank/domain'

export const createTestReviewModel = (resources: AppResources, testId: string) => {
  const { learner, localization, questions } = resources
  const saved = learner()?.mockSittings.find((sitting) => sitting.id === testId)
  const index = atom(saved?.currentQuestion ?? 0, 'testReview.index')
  const picker = atom(false, 'testReview.picker')
  const error = atom<'storage' | 'storageConflict' | null>(null, 'testReview.error')

  const review = computed(() => {
    const sitting = learner()?.mockSittings.find((item) => item.id === testId)
    const summary = learner.progress.mocks().find((item) => item.id === testId)
    const answer = sitting?.answers[index()]
    const loaded = answer === undefined ? undefined : questions.getQuestion(answer.questionKey)

    if (
      sitting === undefined ||
      sitting.status === 'active' ||
      summary === undefined ||
      answer === undefined ||
      loaded === undefined
    ) {
      throw new Error('This saved test is no longer available. Open test history again.')
    }

    return {
      sitting,
      summary,
      answer,
      loaded,
      index: index(),
      finishReason: getMockFinishReason(sitting),
    }
  }, 'testReview')

  return review.extend(() => ({
    localization,
    picker,
    error,
    translation: localization.translation,
    go: action((next: number) => {
      if (next >= 0 && next < review().sitting.answers.length) {
        index.set(next)

        picker.set(false)
      }
    }, 'testReview.go'),
    openPicker: action(() => picker.set(true), 'testReview.openPicker'),
    closePicker: action(() => picker.set(false), 'testReview.closePicker'),
    setTranslation: action(async (studyTranslation: boolean) => {
      error.set(null)

      try {
        await wrap(learner.updatePreferences({ studyTranslation }))
      } catch (cause) {
        error.set(
          isLearnerStateConflict(cause instanceof Error ? cause : undefined)
            ? 'storageConflict'
            : 'storage',
        )
      }
    }, 'testReview.setTranslation').extend(withAsync()),
    reload: action(() => window.location.reload(), 'testReview.reload'),
    entries: computed(() => {
      const { sitting } = review()

      return sitting.answers.map((answer, position) => {
        const loaded = questions.getQuestion(answer.questionKey)

        if (loaded === undefined) {
          throw new Error(`Missing saved test question ${answer.questionKey}.`)
        }

        const feedback = getAnswerFeedback(
          loaded.question,
          sitting.status === 'completed' ? 'completed-review' : 'unfinished-review',
          answer.selectedOption,
        )

        return {
          key: answer.questionKey,
          index: position,
          feedback,
          isAnswered: answer.selectedOption !== null,
        }
      })
    }, 'testReview.entries'),
  }))
}

export type TestReviewModel = ReturnType<typeof createTestReviewModel>

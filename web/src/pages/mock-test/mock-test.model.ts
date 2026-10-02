import { action, atom, computed, effect, urlAtom, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { QuestionKey } from '../../modules/question-bank'

export const createMockPageModel = (
  resources: AppResources,
  testId: string | undefined,
  questionKey: QuestionKey | undefined,
  openQuestion: (id: string, key: QuestionKey) => void,
) => {
  const { mock, learner, localization, questions } = resources
  const picker = atom(false, 'mockPage.picker')

  const current = computed(() => {
    const sitting = learner()?.mockSittings.find((item) => item.id === testId) ?? null
    const index = sitting?.answers.findIndex((answer) => answer.questionKey === questionKey) ?? -1
    const answer = sitting?.answers[index]
    const loaded = answer === undefined ? undefined : questions.getQuestion(answer.questionKey)

    return { sitting, index, answer, loaded }
  }, 'mockPage.current')

  return current.extend(() => ({
    mock,
    localization,
    picker,
    openPicker: action(() => picker.set(true), 'mockPage.openPicker'),
    closePicker: action(() => picker.set(false), 'mockPage.closePicker'),
    returnToQuestions: action(() => {
      mock.cancelSubmission()

      picker.set(true)
    }, 'mockPage.returnToQuestions'),
    start: action(async () => {
      await wrap(mock.start())

      const sitting = mock()
      const first = sitting?.answers[0]

      if (sitting !== null && first !== undefined) {
        openQuestion(sitting.id, first.questionKey)
      }
    }, 'mockPage.start').extend(withAsync()),
    go: action((index: number) => {
      const sitting = current().sitting
      const answer = sitting?.answers[index]

      if (sitting !== null && answer !== undefined && sitting.status === 'active') {
        picker.set(false)

        openQuestion(sitting.id, answer.questionKey)
      }
    }, 'mockPage.go'),
    connect: action(() => {
      const watcher = effect(() => {
        const sitting = current().sitting
        const seconds = mock.remaining()

        if (sitting?.status === 'completed') {
          mock.cancelSubmission()

          urlAtom.go(`/progress/tests/${encodeURIComponent(sitting.id)}`, true)
        } else if (
          sitting?.status === 'active' &&
          seconds === 0 &&
          !mock.pending() &&
          mock.error() === null
        ) {
          void mock.expire()
        }
      }, 'mockPage.lifecycle')

      return () => watcher.unsubscribe()
    }, 'mockPage.connect'),
  }))
}

export type MockPageModel = ReturnType<typeof createMockPageModel>

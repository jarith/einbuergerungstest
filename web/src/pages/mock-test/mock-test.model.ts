import { action, atom, computed, effect, urlAtom, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { QuestionKey } from '../../modules/question-bank'
import { getAppPath } from '../../app/offline/app-mode'
import { isLearnerStateConflict } from '../../modules/learner-state'
import { createQuestionMotion, createQuestionSession } from '../../modules/question-session'
import { browserNavigationAtom } from '../../shared/navigation/browser-navigation.model'

export const createMockPageModel = (
  resources: AppResources,
  testId: string | undefined,
  questionKey: QuestionKey | undefined,
  openQuestion: (id: string, key: QuestionKey) => void,
  motion = createQuestionMotion(),
  picker = atom(false, 'mockPage.picker'),
) => {
  const { mock, learner, localization, questions } = resources

  const current = computed(() => {
    const sitting = learner()?.mockSittings.find((item) => item.id === testId) ?? null
    const index = sitting?.answers.findIndex((answer) => answer.questionKey === questionKey) ?? -1
    const answer = sitting?.answers[index]
    const loaded = answer === undefined ? undefined : questions.getQuestion(answer.questionKey)

    return { sitting, index, answer, loaded }
  }, 'mockPage.current')

  const questionSession = createQuestionSession(
    {
      current: () => ({
        key: current().loaded?.key ?? '',
        index: current().index,
        total: current().sitting?.answers.length ?? 0,
        isPending:
          mock.pending() || mock.remaining() === 0 || current().sitting?.status !== 'active',
        canAnswer: current().answer !== undefined,
        canFinish: false,
      }),
      answer: async (option) => {
        const loaded = current().loaded

        if (loaded !== undefined) {
          await wrap(mock.select(loaded.key, option))
        }
      },
      navigate: (index) => {
        const sitting = current().sitting
        const answer = sitting?.answers[index]

        if (sitting === null || answer === undefined || sitting.status !== 'active') {
          return false
        }

        openQuestion(sitting.id, answer.questionKey)

        return true
      },
    },
    motion,
  )

  return current.extend(() => ({
    mock,
    questions: questionSession,
    hasConflict: computed(
      () => isLearnerStateConflict(mock.error() ?? undefined),
      'mockPage.hasConflict',
    ),
    reload: action(() => window.location.reload(), 'mockPage.reload'),
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
    connect: action(() => {
      const watcher = effect(() => {
        const sitting = current().sitting
        const seconds = mock.remaining()

        if (sitting?.status === 'completed') {
          browserNavigationAtom.cancel()

          mock.cancelSubmission()

          urlAtom.go(getAppPath(`/progress/tests/${encodeURIComponent(sitting.id)}`), true)
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

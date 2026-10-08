import { action, atom, computed, withAsync, withConnectHook, wrap } from '@reatom/core'

import type { createLearnerState } from '../../learner-state'
import type { OptionLabel, QuestionBank, QuestionKey } from '../../question-bank'
import { createMockPaper } from '../../mock-paper'
import { getRemainingSeconds } from '../domain/mock-test'

export const createMockTest = (
  bank: QuestionBank,
  learner: ReturnType<typeof createLearnerState>,
) => {
  const now = atom(Date.now(), 'mockTest.now').extend(
    withConnectHook((clock) => {
      const tick = action(() => clock.set(Date.now()), 'mockTest.tick')
      const interval = setInterval(wrap(tick), 1000)

      tick()

      return () => clearInterval(interval)
    }),
  )

  const active = computed(
    () => learner()?.mockSittings.find((sitting) => sitting.status === 'active') ?? null,
    'mockTest.active',
  )

  const error = atom<Error | null>(null, 'mockTest.error')
  const submission = atom(false, 'mockTest.submission')

  const run = action(async (operation: () => Promise<void>) => {
    error.set(null)

    try {
      await wrap(operation())
    } catch (cause: unknown) {
      error.set(
        cause instanceof Error ? cause : new Error('Could not save the mock test.', { cause }),
      )
    }
  }, 'mockTest.run').extend(withAsync())

  const finish = async () => {
    const sitting = active()

    if (sitting !== null) {
      await wrap(learner.finishMock(sitting.id, 'completed'))
    }

    submission.set(false)
  }

  const model = active.extend(() => ({
    error,
    submission,
    pending: computed(() => run.pending() > 0 || learner.pending() > 0, 'mockTest.pending'),
    remaining: computed(() => {
      const sitting = active()

      return sitting === null ? 0 : getRemainingSeconds(sitting, now())
    }, 'mockTest.remaining'),
    unanswered: computed(
      () => active()?.answers.filter((answer) => answer.selectedOption === null).length ?? 0,
      'mockTest.unanswered',
    ),
    start: action(async () => {
      await wrap(
        run(async () => {
          if (active() === null) {
            await wrap(learner.startMock(createMockPaper(bank.questions, Math.random)))

            submission.set(false)
          }
        }),
      )
    }, 'mockTest.start').extend(withAsync()),
    select: action(async (key: QuestionKey, selection: OptionLabel) => {
      const sitting = active()

      if (sitting !== null) {
        await wrap(run(() => learner.selectMockAnswer(sitting.id, key, selection)))
      }
    }, 'mockTest.select').extend(withAsync()),
    navigate: action(async (key: QuestionKey) => {
      const sitting = active()

      if (sitting !== null) {
        const index = sitting.answers.findIndex((answer) => answer.questionKey === key)

        await wrap(run(() => learner.navigateMock(sitting.id, index)))
      }
    }, 'mockTest.navigate').extend(withAsync()),
    submit: action(async () => {
      const sitting = active()

      if (sitting !== null && sitting.answers.some((answer) => answer.selectedOption === null)) {
        submission.set(true)
      } else {
        await wrap(run(finish))
      }
    }, 'mockTest.submit').extend(withAsync()),
    confirmSubmission: action(
      async () => await wrap(run(finish)),
      'mockTest.confirmSubmission',
    ).extend(withAsync()),
    cancelSubmission: action(() => submission.set(false), 'mockTest.cancelSubmission'),
    expire: action(async () => {
      const sitting = active()

      if (sitting !== null && Date.now() >= sitting.deadline) {
        await wrap(run(() => learner.expireMock(sitting.id)))
      }
    }, 'mockTest.expire').extend(withAsync()),
    leave: action(async () => {
      const sitting = active()

      if (sitting !== null) {
        await wrap(learner.finishMock(sitting.id, 'unfinished'))
      }
    }, 'mockTest.leave').extend(withAsync()),
  }))

  return model.extend(() => ({
    hasExpired: computed(() => model.remaining() === 0, 'mockTest.hasExpired'),
    // Navigation persists only the position; it must not refresh submission controls.
    saving: computed(
      () =>
        run.pending() > model.navigate.pending() ||
        learner.pending() > learner.navigateMock.pending(),
      'mockTest.saving',
    ),
  }))
}

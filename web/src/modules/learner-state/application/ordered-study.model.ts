import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type {
  OptionLabel,
  QuestionBank,
  QuestionKey,
} from '../../question-bank/domain/question-bank'
import type { StudyPosition } from '../domain/learner-state'
import type { createLearnerState } from './learner-state.model'
import { getQuestionKey } from '../../question-bank/domain/question-bank'

export const createOrderedStudy = (
  bank: QuestionBank,
  learner: ReturnType<typeof createLearnerState>,
  target?: QuestionKey,
) => {
  const ordered = bank.questions.toSorted((left, right) => left.number - right.number)
  const first = ordered[0]

  if (
    first === undefined ||
    (target !== undefined && !ordered.some((question) => getQuestionKey(question) === target))
  ) {
    throw new Error('Choose a question in the ordered question bank.')
  }
  const initialKey = target ?? getQuestionKey(first)

  const inspection = atom<StudyPosition>(
    { questionKey: initialKey, status: 'in-progress' },
    'orderedStudy.inspection',
  )

  const retryKey = atom<QuestionKey | null>(null, 'orderedStudy.retryKey')
  const error = atom<Error | null>(null, 'orderedStudy.error')
  const busy = atom(false, 'orderedStudy.busy')

  const position = computed(() => {
    if (target !== undefined) {
      return inspection()
    }

    return learner()?.positions.all ?? { questionKey: initialKey, status: 'in-progress' as const }
  }, 'orderedStudy.position')

  const current = computed(() => {
    const saved = position()
    const index = ordered.findIndex((question) => getQuestionKey(question) === saved.questionKey)
    const question = ordered[index]

    if (question === undefined) {
      throw new Error('The saved study question is not in the question bank.')
    }
    const key = getQuestionKey(question)

    return {
      question,
      key,
      index,
      total: ordered.length,
      isCompleted: saved.status === 'completed',
      selectedOption:
        retryKey() === key
          ? null
          : (learner.progress.questions().get(key)?.lastAttempt?.selectedOption ?? null),
      isInspection: target !== undefined,
    }
  }, 'orderedStudy.current')

  const run = action(async (operation: () => Promise<void>) => {
    if (busy()) {
      return
    }

    busy.set(true)

    error.set(null)

    try {
      await wrap(operation())
    } catch (cause: unknown) {
      error.set(
        cause instanceof Error ? cause : new Error('Could not save study progress.', { cause }),
      )
    } finally {
      busy.set(false)
    }
  }, 'orderedStudy.run').extend(withAsync())

  const savePosition = async (next: StudyPosition) => {
    if (target === undefined) {
      await wrap(learner.setStudyPosition(null, next))
    } else {
      inspection.set(next)
    }

    retryKey.set(null)
  }

  return current.extend(() => ({
    error,
    pending: computed(() => busy() || learner.pending() > 0, 'orderedStudy.pending'),
    answer: action(async (selection: OptionLabel) => {
      await wrap(
        run(async () => {
          const question = current()

          if (question.isCompleted || question.selectedOption !== null) {
            return
          }

          await wrap(learner.recordStudyAnswer(question.key, selection))

          retryKey.set(null)
        }),
      )
    }, 'orderedStudy.answer').extend(withAsync()),
    retry: action(() => {
      if (!busy() && !current().isCompleted) {
        retryKey.set(current().key)

        error.set(null)
      }
    }, 'orderedStudy.retry'),
    previous: action(async () => {
      await wrap(
        run(async () => {
          const question = current()
          const previous = ordered[question.isCompleted ? question.index : question.index - 1]

          if (previous !== undefined) {
            await wrap(
              savePosition({ questionKey: getQuestionKey(previous), status: 'in-progress' }),
            )
          }
        }),
      )
    }, 'orderedStudy.previous').extend(withAsync()),
    next: action(async () => {
      await wrap(
        run(async () => {
          const question = current()

          if (question.isCompleted) {
            return
          }
          const next = ordered[question.index + 1]

          await wrap(
            savePosition(
              next === undefined
                ? { questionKey: question.key, status: 'completed' }
                : { questionKey: getQuestionKey(next), status: 'in-progress' },
            ),
          )
        }),
      )
    }, 'orderedStudy.next').extend(withAsync()),
    restart: action(async () => {
      await wrap(
        run(() => savePosition({ questionKey: getQuestionKey(first), status: 'in-progress' })),
      )
    }, 'orderedStudy.restart').extend(withAsync()),
    setTranslation: action(async (studyTranslation: boolean) => {
      await wrap(run(() => learner.updatePreferences({ studyTranslation })))
    }, 'orderedStudy.setTranslation').extend(withAsync()),
  }))
}

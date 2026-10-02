import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type {
  OptionLabel,
  QuestionBank,
  QuestionKey,
} from '../../question-bank/domain/question-bank'
import type { StudyPosition } from '../domain/learner-state'
import type { createLearnerState } from './learner-state.model'
import { getQuestionKey } from '../../question-bank/domain/question-bank'

export type StudyMode = 'sequential' | 'inspection'

export const createOrderedStudy = (
  bank: QuestionBank,
  learner: ReturnType<typeof createLearnerState>,
  target: QuestionKey,
  mode: StudyMode,
  groupId: string | null = null,
) => {
  if (groupId !== null && !bank.groups.some((group) => group.id === groupId)) {
    throw new Error('Choose a group in the question bank.')
  }

  const ordered = bank.questions.filter(
    (question) => groupId === null || question.group_id === groupId,
  )

  const first = ordered[0]

  if (first === undefined || !ordered.some((question) => getQuestionKey(question) === target)) {
    throw new Error('Choose a question in the ordered question bank.')
  }

  const savedPosition =
    groupId === null ? learner()?.positions.all : learner()?.positions.groups[groupId]

  const position = atom<StudyPosition>(
    {
      questionKey: target,
      status:
        mode === 'sequential' && savedPosition?.questionKey === target
          ? savedPosition.status
          : 'in-progress',
    },
    'orderedStudy.position',
  )

  const retryKey = atom<QuestionKey | null>(null, 'orderedStudy.retryKey')
  const error = atom<Error | null>(null, 'orderedStudy.error')
  const busy = atom(false, 'orderedStudy.busy')

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
      isInspection: mode === 'inspection',
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
    if (mode === 'sequential') {
      await wrap(learner.setStudyPosition(groupId, next))
    }

    position.set(next)

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

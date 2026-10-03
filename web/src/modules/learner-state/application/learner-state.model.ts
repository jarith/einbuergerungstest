import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type { QuestionBank, QuestionKey, OptionLabel } from '../../question-bank/domain'
import type {
  LearnerSnapshot,
  MockSitting,
  Preferences,
  StudyPosition,
} from '../domain/learner-state'
import { finalizeMockSitting } from '../../mock-test/domain'
import { selectQuestionOption, getQuestionKey } from '../../question-bank/domain'
import {
  createLearnerSnapshot,
  getLocalDate,
  getNextAttemptTime,
  normalizeLearnerLaunch,
} from '../domain/learner-state'
import { createLearnerRepository } from '../infrastructure/learner-repository'
import { decodeLearnerSnapshot, parsePlannedDate } from '../infrastructure/snapshot-codec'
import { createProgressModel } from './progress.model'

type SnapshotMutation = (snapshot: LearnerSnapshot) => LearnerSnapshot

type Confirmation =
  | Readonly<{ kind: 'reset' }>
  | Readonly<{
      kind: 'import'
      source: string
      studyAttempts: number
      completedMocks: number
      unfinishedMocks: number
      preferences: Preferences
    }>
  | null

export const createLearnerState = (bank: QuestionBank) => {
  const repository = createLearnerRepository()
  const snapshotAtom = atom<LearnerSnapshot | null>(null, 'learnerState.snapshotAtom')
  const errorAtom = atom<Error | null>(null, 'learnerState.errorAtom')
  const confirmationAtom = atom<Confirmation>(null, 'learnerState.confirmationAtom')
  const questions = new Map(bank.questions.map((question) => [getQuestionKey(question), question]))
  const operations = { queue: Promise.resolve() }

  const validateSelection = (key: QuestionKey, selection: OptionLabel) => {
    const question = questions.get(key)

    if (question === undefined) {
      throw new Error(`Unknown question ${key} in the question bank.`)
    }

    return selectQuestionOption(question, selection)
  }

  const requireSnapshot = () => {
    const current = snapshotAtom()

    if (current === null) {
      throw new Error('Learner data is not ready. Wait for startup or retry loading.')
    }

    return current
  }

  const validateReferences = (current: LearnerSnapshot) => {
    const requireQuestion = (key: QuestionKey) => {
      if (!questions.has(key)) {
        throw new Error(`Unknown question ${key} in the question bank.`)
      }
    }

    current.studyAttempts.forEach((attempt) => requireQuestion(attempt.questionKey))

    current.mockSittings.forEach((sitting) => {
      sitting.answers.forEach((answer) => requireQuestion(answer.questionKey))
    })

    if (current.positions.all !== null) {
      requireQuestion(current.positions.all.questionKey)
    }

    Object.entries(current.positions.groups).forEach(([group, position]) => {
      if (position !== undefined && questions.get(position.questionKey)?.group_id !== group) {
        throw new Error(`Study position does not belong to group ${group}.`)
      }
    })
  }

  const enqueue = (operation: () => Promise<void>): Promise<void> => {
    const pending = operations.queue.then(
      wrap(async () => {
        try {
          await wrap(operation())

          errorAtom.set(null)
        } catch (cause: unknown) {
          const failure =
            cause instanceof Error
              ? cause
              : new Error('Learner storage operation failed.', { cause })

          errorAtom.set(failure)

          throw failure
        }
      }),
    )

    // Recover the queue, while returning the rejecting operation to its caller.
    operations.queue = pending.catch(() => undefined)

    return pending
  }

  const bootstrap = action(async () => {
    await wrap(
      enqueue(async () => {
        if (snapshotAtom() !== null) {
          return
        }
        const saved = await wrap(repository.read())

        const current = decodeLearnerSnapshot(
          JSON.stringify(normalizeLearnerLaunch(saved ?? createLearnerSnapshot(), new Date())),
        )

        validateReferences(current)

        await wrap(repository.replace(current, saved))

        snapshotAtom.set(current)
      }),
    )
  }, 'learnerState.bootstrap').extend(withAsync())

  const mutate = action(async (update: SnapshotMutation) => {
    await wrap(
      enqueue(async () => {
        const previous = requireSnapshot()
        const next = decodeLearnerSnapshot(JSON.stringify(update(previous)))

        validateReferences(next)

        await wrap(repository.replace(next, previous))

        snapshotAtom.set(next)
      }),
    )
  }, 'learnerState.mutate').extend(withAsync())

  const updatePreferences = action(async (patch: Partial<Preferences>) => {
    const captured = { ...patch }

    await wrap(
      mutate((current) => {
        if (captured.plannedTestDate !== undefined) {
          const date = parsePlannedDate(captured.plannedTestDate)

          if (date !== null && date < getLocalDate(new Date())) {
            throw new Error('Choose today or a future planned test date.')
          }
        }

        return { ...current, preferences: { ...current.preferences, ...captured } }
      }),
    )
  }, 'learnerState.updatePreferences').extend(withAsync())

  const setStudyPosition = action(async (group: string | null, position: StudyPosition) => {
    const captured = { ...position }

    await wrap(
      mutate((current) => ({
        ...current,
        positions:
          group === null
            ? { ...current.positions, all: captured }
            : { ...current.positions, groups: { ...current.positions.groups, [group]: captured } },
      })),
    )
  }, 'learnerState.setStudyPosition').extend(withAsync())

  const recordStudyAnswer = action(
    async (questionKey: QuestionKey, selectedOption: OptionLabel) => {
      const selection = validateSelection(questionKey, selectedOption)
      const id = crypto.randomUUID()

      await wrap(
        mutate((current) => ({
          ...current,
          studyAttempts: [
            ...current.studyAttempts,
            {
              id,
              questionKey,
              selectedOption: selection,
              answeredAt: getNextAttemptTime(current, Date.now()),
            },
          ],
        })),
      )
    },
    'learnerState.recordStudyAnswer',
  ).extend(withAsync())

  const startMock = action(async (paper: readonly QuestionKey[]) => {
    const answers = paper.map((questionKey) => ({ questionKey, selectedOption: null }))
    const startedAt = Date.now()
    const id = crypto.randomUUID()

    await wrap(
      mutate((current) => ({
        ...current,
        mockSittings: [
          ...current.mockSittings,
          {
            id,
            startedAt,
            deadline: startedAt + 60 * 60 * 1000,
            currentQuestion: 0,
            answers,
            status: 'active',
          },
        ],
      })),
    )

    return id
  }, 'learnerState.startMock').extend(withAsync())

  const updateMock = (
    current: LearnerSnapshot,
    id: string,
    update: (sitting: MockSitting) => MockSitting,
  ): LearnerSnapshot => {
    if (!current.mockSittings.some((sitting) => sitting.id === id)) {
      throw new Error('This mock sitting does not exist.')
    }

    return {
      ...current,
      mockSittings: current.mockSittings.map((sitting) =>
        sitting.id === id ? update(sitting) : sitting,
      ),
    }
  }

  const selectMockAnswer = action(
    async (id: string, questionKey: QuestionKey, selectedOption: OptionLabel | null) => {
      const selection =
        selectedOption === null ? null : validateSelection(questionKey, selectedOption)

      await wrap(
        mutate((current) =>
          updateMock(current, id, (sitting) => {
            if (
              sitting.status !== 'active' ||
              !sitting.answers.some((answer) => answer.questionKey === questionKey)
            ) {
              throw new Error('Only questions in the active mock can be answered.')
            }

            const now = Date.now()

            if (now >= sitting.deadline) {
              return finalizeMockSitting(
                sitting,
                'completed',
                now,
                getNextAttemptTime(current, now),
              )
            }

            return {
              ...sitting,
              answers: sitting.answers.map((answer) =>
                answer.questionKey === questionKey
                  ? { ...answer, selectedOption: selection }
                  : answer,
              ),
            }
          }),
        ),
      )
    },
    'learnerState.selectMockAnswer',
  ).extend(withAsync())

  const navigateMock = action(async (id: string, currentQuestion: number) => {
    await wrap(
      mutate((current) =>
        updateMock(current, id, (sitting) => {
          if (sitting.status !== 'active') {
            throw new Error('Only an active mock can be navigated.')
          }

          const now = Date.now()

          if (now >= sitting.deadline) {
            return finalizeMockSitting(sitting, 'completed', now, getNextAttemptTime(current, now))
          }

          return { ...sitting, currentQuestion }
        }),
      ),
    )
  }, 'learnerState.navigateMock').extend(withAsync())

  const finishMock = action(async (id: string, status: 'completed' | 'unfinished') => {
    await wrap(
      mutate((current) =>
        updateMock(current, id, (sitting) => {
          const now = Date.now()

          return finalizeMockSitting(sitting, status, now, getNextAttemptTime(current, now))
        }),
      ),
    )
  }, 'learnerState.finishMock').extend(withAsync())

  const expireMock = action(async (id: string) => {
    await wrap(
      mutate((current) =>
        updateMock(current, id, (sitting) => {
          const now = Date.now()

          return now >= sitting.deadline
            ? finalizeMockSitting(sitting, 'completed', now, getNextAttemptTime(current, now))
            : sitting
        }),
      ),
    )
  }, 'learnerState.expireMock').extend(withAsync())

  const previewImport = action((source: string) => {
    confirmationAtom.set(null)

    try {
      const imported = decodeLearnerSnapshot(source)

      validateReferences(imported)

      confirmationAtom.set(
        Object.freeze({
          kind: 'import',
          source: JSON.stringify(imported),
          preferences: imported.preferences,
          studyAttempts: imported.studyAttempts.length,
          completedMocks: imported.mockSittings.filter((sitting) => sitting.status === 'completed')
            .length,
          unfinishedMocks: imported.mockSittings.filter((sitting) => sitting.status !== 'completed')
            .length,
        }),
      )

      errorAtom.set(null)
    } catch (cause: unknown) {
      const failure =
        cause instanceof Error ? cause : new Error('Could not read backup.', { cause })

      errorAtom.set(failure)

      throw failure
    }
  }, 'learnerState.previewImport')

  const confirmReplacement = action(async () => {
    const pending = confirmationAtom()

    if (pending === null) {
      throw new Error('Preview a backup or request reset before confirming replacement.')
    }

    confirmationAtom.set(null)

    try {
      await wrap(
        mutate(() =>
          pending.kind === 'reset'
            ? createLearnerSnapshot()
            : normalizeLearnerLaunch(decodeLearnerSnapshot(pending.source), new Date()),
        ),
      )
    } catch (cause: unknown) {
      if (confirmationAtom() === null) {
        confirmationAtom.set(pending)
      }
      throw cause
    }
  }, 'learnerState.confirmReplacement').extend(withAsync())

  const learnerStateAtom = computed(() => snapshotAtom(), 'learnerState').extend(() => ({
    bootstrap,
    progress: createProgressModel(bank, requireSnapshot),
    updatePreferences,
    setStudyPosition,
    recordStudyAnswer,
    startMock,
    selectMockAnswer,
    navigateMock,
    finishMock,
    expireMock,
    previewImport,
    confirmReplacement,
    requestReset: action(
      () => confirmationAtom.set({ kind: 'reset' }),
      'learnerState.requestReset',
    ),
    cancelReplacement: action(() => confirmationAtom.set(null), 'learnerState.cancelReplacement'),
    exportBackup: action(async () => {
      await wrap(operations.queue)

      return JSON.stringify(requireSnapshot(), null, 2)
    }, 'learnerState.exportBackup').extend(withAsync()),
    error: computed(() => errorAtom(), 'learnerState.errorView'),
    confirmation: computed(() => confirmationAtom(), 'learnerState.confirmationView'),
    pending: computed(() => bootstrap.pending() + mutate.pending(), 'learnerState.pending'),
  }))

  return learnerStateAtom
}

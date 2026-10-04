import { action, urlAtom, wrap } from '@reatom/core'

import { loadAppResources } from '../../web/src/app/bootstrap.model'
import { createBackupModel } from '../../web/src/modules/learner-state/application/backup.model'
import { createLearnerState } from '../../web/src/modules/learner-state/application/learner-state.model'
import { createOrderedStudy } from '../../web/src/modules/learner-state/application/ordered-study.model'
import { createStartupRecovery } from '../../web/src/modules/learner-state/application/startup-recovery.model'
import { getRemainingSeconds } from '../../web/src/modules/mock-test/domain/mock-test'
import { getAnswerFeedback } from '../../web/src/modules/question-bank/domain/question-answer'
import { createDashboardModel } from '../../web/src/pages/dashboard/dashboard.model'
import { createMockPageModel } from '../../web/src/pages/mock-test/mock-test.model'
import { createQuestionListModel } from '../../web/src/pages/question-list/question-list.model'
import { createTestReviewModel } from '../../web/src/pages/test-review/test-review.model'
import { browserNavigationAtom } from '../../web/src/shared/navigation/browser-navigation.model'
import { savedProfile, rejectedProfile, replacementProfile } from './fixtures/storage'

type ScenarioState = {
  resources?: Awaited<ReturnType<typeof loadAppResources>>
  study?: ReturnType<typeof createOrderedStudy>
  dashboard?: ReturnType<typeof createDashboardModel>
  list?: ReturnType<typeof createQuestionListModel>
  backup?: ReturnType<typeof createBackupModel>
  review?: ReturnType<typeof createTestReviewModel>
  recovery?: ReturnType<typeof createStartupRecovery>
  failure?: Error
  exported?: string
  rejected?: string
  group: string | null
  notedQuestion: number
  neutralFirst: boolean
  dispose: (() => void)[]
}

const createHarness = () => {
  const state: ScenarioState = { group: null, notedQuestion: 1, neutralFirst: false, dispose: [] }

  const resources = () => {
    if (!state.resources) {
      throw new Error('Start a learner before using the integration driver.')
    }

    return state.resources
  }

  const question = (order: number) => {
    const value = resources().questions.bank.questions.find((item) => item.order === order)

    if (!value) {
      throw new Error(`Unknown question ${order}`)
    }

    return value
  }

  const study = () => {
    if (!state.study) {
      throw new Error('Start a study session first.')
    }

    return state.study
  }

  const dashboard = () => {
    if (!state.dashboard) {
      throw new Error('Start a learner first.')
    }

    return state.dashboard
  }

  const backup = () => {
    if (!state.backup) {
      throw new Error('Start a learner first.')
    }

    return state.backup
  }

  const list = () => {
    if (!state.list) {
      throw new Error('Start a learner first.')
    }

    return state.list
  }

  const recovery = () => {
    if (!state.recovery) {
      throw new Error('Load a rejected profile first.')
    }

    return state.recovery
  }

  const sitting = () => {
    const value = resources().learner()?.mockSittings.at(-1)

    if (!value) {
      throw new Error('Start a mock first.')
    }

    return value
  }

  const review = () => {
    state.review ??= createTestReviewModel(resources(), sitting().id)

    return state.review
  }

  const startStudy = (order?: number, group: string | null = null) => {
    const app = resources()

    const position =
      group === null ? app.learner()?.positions.all : app.learner()?.positions.groups[group]

    const first = app.questions.bank.questions.find(
      (item) => group === null || item.group_id === group,
    )

    if (!first) {
      throw new Error(`Empty study group ${group}`)
    }
    const target = order === undefined ? (position?.questionKey ?? first.id) : question(order).id
    state.group = group
    state.study = createOrderedStudy(app.questions.bank, app.learner, target, 'sequential', group)
  }

  const launch = action(async () => {
    state.dispose.forEach((dispose) => dispose())

    state.dispose = []
    state.resources?.localization.dispose()
    delete state.review
    delete state.study
    delete state.failure
    try {
      const app = await wrap(loadAppResources())
      state.resources = app
      state.dashboard = createDashboardModel(app)
      state.list = createQuestionListModel(app)
      state.backup = createBackupModel(app.learner)

      state.dispose.push(state.dashboard.date.subscribe(() => undefined))
    } catch (cause) {
      if (!(cause instanceof Error)) {
        throw cause
      }
      state.failure = cause

      state.recovery = createStartupRecovery(
        () => state.failure,
        () => undefined,
      )
    }
  }, 'test.launch')

  const startMock = action(async () => {
    const app = resources()

    if (state.neutralFirst) {
      // Arrange a specific paper through the public application boundary, independent of RNG implementation.
      const general = app.questions.bank.questions.filter(
        (item) => item.section === 'general' && item.order !== 20,
      )

      const berlin = app.questions.bank.questions.filter((item) => item.section === 'berlin')

      await wrap(
        app.learner.startMock(
          [question(20), ...general.slice(0, 29), ...berlin.slice(0, 3)].map((item) => item.id),
        ),
      )
    } else {
      await wrap(app.mock.start())
    }
    const current = sitting()

    const model = createMockPageModel(
      app,
      current.id,
      current.answers[0]?.questionKey,
      () => undefined,
    )

    state.dispose.push(model.connect())
  }, 'test.startMock')

  const restart = action(async () => {
    const position = state.study?.().question.order
    const group = state.group

    await wrap(launch())

    if (position !== undefined && !state.failure) {
      startStudy(position, group)
    }
  }, 'test.restart')

  const changeElsewhere = action(async () => {
    const other = createLearnerState(resources().questions.bank)

    await wrap(other.bootstrap())

    await wrap(other.updatePreferences({ appearance: 'dark' }))
  }, 'test.changeElsewhere')

  const prepareRejected = action(async (kind: string) => {
    state.rejected = rejectedProfile(kind)

    await wrap(savedProfile(state.rejected))

    await wrap(launch())
  }, 'test.prepareRejected')

  browserNavigationAtom.start((destination) => {
    const active = state.resources?.mock()

    return active && destination.pathname === '/leave-mock'
      ? { leave: () => resources().mock.leave() }
      : null
  })

  return {
    requestExit: () => urlAtom.go('/leave-mock'),
    mockFeedback: () => {
      const current = sitting()
      const answer = current.answers[current.currentQuestion]
      const loaded = answer && resources().questions.getQuestion(answer.questionKey)

      if (!answer || !loaded) {
        throw new Error('Missing current mock question')
      }

      return getAnswerFeedback(
        loaded.question,
        current.status === 'active'
          ? 'live-mock'
          : current.status === 'completed'
            ? 'completed-review'
            : 'unfinished-review',
        answer.selectedOption,
      )
    },
    state,
    resources,
    question,
    study,
    dashboard,
    list,
    backup,
    sitting,
    review,
    recovery,
    launch,
    restart,
    startStudy,
    startMock,
    changeElsewhere,
    prepareRejected,
    savedProfile,
    replacementProfile,
    navigation: browserNavigationAtom,
    progress: (order: number) => resources().learner.progress.questions().get(question(order).id),
    feedback: () => getAnswerFeedback(study()().question, 'study', study()().selectedOption),
    remaining: () => getRemainingSeconds(sitting(), Date.now()),
  }
}

declare global {
  interface Window {
    behavior: ReturnType<typeof createHarness>
  }
}

window.behavior = createHarness()

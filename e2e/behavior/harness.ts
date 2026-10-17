import { action, computed, take, urlAtom, wrap } from '@reatom/core'

import type { loadAppResources } from '../../web/src/app/bootstrap.model'
import type { OptionLabel } from '../../web/src/modules/question-bank'
import type { MockPageModel } from '../../web/src/pages/mock-test/mock-test.model'
import type { StudyModel } from '../../web/src/pages/study/study.model'
import type { createStudyRoutes } from '../../web/src/pages/study/study.route'
import { appRoute, routes as appRoutes } from '../../web/src/app/app.route'
import { startNavigation } from '../../web/src/app/navigation.model'
import { createBackupModel } from '../../web/src/modules/learner-state/application/backup.model'
import { createLearnerState } from '../../web/src/modules/learner-state/application/learner-state.model'
import { createStartupRecovery } from '../../web/src/modules/learner-state/application/startup-recovery.model'
import { getAnswerFeedback } from '../../web/src/modules/question-bank/domain/question-answer'
import { createDashboardModel } from '../../web/src/pages/dashboard/dashboard.model'
import { createProgressPageModel } from '../../web/src/pages/progress/progress.model'
import { createTestReviewModel } from '../../web/src/pages/test-review/test-review.model'
import { browserNavigationAtom } from '../../web/src/shared/navigation/browser-navigation.model'
import { savedProfile, rejectedProfile, replacementProfile } from './fixtures/storage'

const createStudyLoader = (routes: ReturnType<typeof createStudyRoutes>) =>
  computed(() => {
    const route = Object.values(routes).find((candidate) => candidate.exact())

    if (route === undefined) {
      return { model: undefined, error: undefined }
    }

    // Entry loaders redirect. Observe the destination loader instead of awaiting
    // an entry promise that the redirect legitimately invalidates.
    void route.loader()

    return {
      model:
        (route === routes.study || route === routes.groupStudy) && route.loader.ready()
          ? route.loader.data()?.model
          : undefined,
      error: route.loader.status().isRejected ? route.loader.error() : undefined,
    }
  }, 'test.studyLoader')

type ScenarioState = {
  resources?: Awaited<ReturnType<typeof loadAppResources>>
  study?: StudyModel
  studyRoutes?: ReturnType<typeof createStudyRoutes>
  studyLoader?: ReturnType<typeof createStudyLoader>
  mockPage?: MockPageModel
  disconnectMock?: () => void
  dashboard?: ReturnType<typeof createDashboardModel>
  list?: ReturnType<typeof createProgressPageModel>
  backup?: ReturnType<typeof createBackupModel>
  review?: ReturnType<typeof createTestReviewModel>
  recovery?: ReturnType<typeof createStartupRecovery>
  recoveryRetry?: Promise<void>
  failure?: Error
  exported?: string
  beforePreview?: { current: string; saved: string | undefined }
  rejected?: string
  notedQuestion: number
  neutralFirst: boolean
  dispose: (() => void)[]
}

const createHarness = () => {
  const state: ScenarioState = { notedQuestion: 1, neutralFirst: false, dispose: [] }

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

  const studyModel = () => {
    if (!state.study) {
      throw new Error('Start a study session first.')
    }

    return state.study
  }

  const study = () => studyModel().flow

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

  const mockPage = () => {
    if (state.mockPage === undefined) {
      throw new Error('Open a mock question first.')
    }

    return state.mockPage
  }

  const loadMock = action(async () => {
    const data = await wrap(appRoutes.mock.question.loader())

    state.disconnectMock?.()
    state.mockPage = data.model
    state.disconnectMock = data.model.connect()
  }, 'test.loadMock')

  const navigateMock = action(async (direction: 'next' | 'previous') => {
    await wrap(mockPage().questions[direction]())

    await wrap(loadMock())
  }, 'test.navigateMock')

  const review = () => {
    state.review ??= createTestReviewModel(resources(), sitting().id)

    return state.review
  }

  const studyRoutes = () => {
    if (!state.studyRoutes) {
      throw new Error('Start a learner before navigating study.')
    }

    return state.studyRoutes
  }

  const loadStudy = action(async () => {
    const loader = state.studyLoader

    if (loader === undefined) {
      throw new Error('Start a learner before loading study.')
    }

    const loaded = { current: loader() }

    while (loaded.current.model === undefined) {
      if (loaded.current.error !== undefined) {
        throw loaded.current.error
      }

      loaded.current = await wrap(take(loader))
    }

    state.study = loaded.current.model
  }, 'test.loadStudy')

  const startStudy = action(async (order?: number, group: string | null = null) => {
    // A new session means departing study and entering through its real route.
    urlAtom.go('/dashboard')

    await wrap(Promise.resolve())

    const routes = studyRoutes()

    if (group !== null) {
      routes.groupEntry.go({ groupId: group })
    } else if (order === undefined) {
      routes.entry.go()
    } else {
      routes.study.go({ questionKey: question(order).id, mode: 'inspection' })
    }

    await wrap(loadStudy())
  }, 'test.startStudy')

  const navigateStudy = action(async (direction: 'next' | 'previous') => {
    await wrap(studyModel().questions[direction]())

    await wrap(loadStudy())
  }, 'test.navigateStudy')

  const restartStudy = action(async () => {
    await wrap(studyModel().restart())

    await wrap(loadStudy())
  }, 'test.restartStudy')

  const launch = action(async () => {
    state.dispose.forEach((dispose) => dispose())

    state.dispose = []
    state.disconnectMock?.()
    delete state.mockPage
    delete state.disconnectMock
    state.resources?.localization.dispose()
    delete state.review
    delete state.study
    delete state.failure
    try {
      const app = await wrap(appRoute.loader.retry())
      state.resources = app
      state.dashboard = createDashboardModel(app)
      state.list = createProgressPageModel(app)
      state.backup = createBackupModel(app.learner)
      state.studyRoutes = appRoutes.study
      state.studyLoader = createStudyLoader(state.studyRoutes)

      // Route subscriptions keep production change hooks active without rendering screens.
      state.dispose.push(state.studyRoutes.study.subscribe(() => undefined))

      state.dispose.push(state.studyRoutes.groupStudy.subscribe(() => undefined))

      state.dispose.push(state.studyLoader.subscribe(() => undefined))

      state.dispose.push(appRoutes.mock.question.subscribe(() => undefined))

      state.dispose.push(state.dashboard.date.subscribe(() => undefined))
    } catch (cause) {
      if (!(cause instanceof Error)) {
        throw cause
      }
      state.failure = cause

      state.recovery = createStartupRecovery(
        () => state.failure,
        () => {
          state.recoveryRetry = launch()
        },
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

    const first = current.answers[0]

    if (first === undefined) {
      throw new Error('A mock paper must contain a first question.')
    }

    appRoutes.mock.question.go({ testId: current.id, questionKey: first.questionKey })

    await wrap(loadMock())
  }, 'test.startMock')

  const reopen = action(async (studyPath: string | null) => {
    await wrap(launch())

    if (studyPath !== null && !state.failure) {
      urlAtom.go(studyPath)

      await wrap(loadStudy())
    }
  }, 'test.reopen')

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

  startNavigation()

  return {
    requestExit: () => appRoutes.dashboard.go(),
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
    reopen,
    startStudy,
    navigateStudy,
    restartStudy,
    answerStudy: (option: OptionLabel) => studyModel().questions.answer(option),
    startMock,
    mockPage,
    navigateMock,
    changeElsewhere,
    prepareRejected,
    savedProfile,
    replacementProfile,
    navigation: browserNavigationAtom,
    progress: (order: number) => resources().learner.progress.questions().get(question(order).id),
    feedback: () => getAnswerFeedback(study()().question, 'study', study()().selectedOption),
    remaining: () => resources().mock.remaining(),
  }
}

declare global {
  interface Window {
    behavior: ReturnType<typeof createHarness>
  }
}

window.behavior = createHarness()

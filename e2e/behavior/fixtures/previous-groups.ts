import type { LearnerSnapshot } from '../../../web/src/modules/learner-state/domain/learner-state'
import { createLearnerSnapshot } from '../../../web/src/modules/learner-state/domain/learner-state'
import { decodeLearnerSnapshot } from '../../../web/src/modules/learner-state/infrastructure/snapshot-codec'
import { sourceQuestion } from '../../support/browser'

export const makePreviousGroupProfile = (now: number): LearnerSnapshot => {
  const snapshot: LearnerSnapshot = {
    ...createLearnerSnapshot(),
    positions: {
      all: { questionKey: 'wm7f3', status: 'in-progress' },
      groups: {
        'constitution-rights': { questionKey: 'wm7f3', status: 'in-progress' },
        'federalism-state-symbols': { questionKey: 't2k2o', status: 'in-progress' },
        'postwar-ddr-reunification': { questionKey: 'htymn', status: 'in-progress' },
        'family-education': { questionKey: 'uz0sv', status: 'in-progress' },
        'europe-eu': { questionKey: '34ee5', status: 'completed' },
        berlin: { questionKey: 'n71rg', status: 'completed' },
      },
    },
    studyAttempts: [
      { id: 'rights', questionKey: 'tg3ei', selectedOption: 'D', answeredAt: now - 10_000 },
      { id: 'courts-first', questionKey: 'wm7f3', selectedOption: 'A', answeredAt: now - 9_000 },
      { id: 'courts-second', questionKey: 'wm7f3', selectedOption: 'A', answeredAt: now - 8_000 },
      { id: 'symbols', questionKey: 't2k2o', selectedOption: 'B', answeredAt: now - 7_000 },
      { id: 'reunification', questionKey: 'htymn', selectedOption: 'A', answeredAt: now - 6_000 },
    ],
    mockSittings: [
      {
        id: 'previous-mock',
        startedAt: now - 5_000,
        deadline: now + 3_595_000,
        endedAt: now - 1_000,
        currentQuestion: 0,
        status: 'completed',
        finishReason: 'submitted',
        answers: [...Array.from({ length: 30 }, (_, index) => index + 1), 301, 302, 303].map(
          (order) => ({
            questionKey: sourceQuestion(order).id,
            selectedOption: order === 2 ? 'B' : null,
          }),
        ),
      },
    ],
  }

  return decodeLearnerSnapshot(JSON.stringify(snapshot))
}

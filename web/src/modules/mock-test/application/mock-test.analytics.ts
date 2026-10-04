import type { Analytics } from '../../../shared/analytics'
import type { createLearnerState } from '../../learner-state'

export const observeMockTestAnalytics = (
  learner: ReturnType<typeof createLearnerState>,
  analytics: Analytics,
) => {
  const observeTerminal = (reason: 'exit' | 'recovered_on_launch') => {
    analytics.run(() => {
      const id = analytics.read('active-mock')
      const sitting = learner()?.mockSittings.find((item) => item.id === id)

      if (sitting === undefined || sitting.status === 'active') {
        return
      }

      analytics.write('active-mock', null)

      const data = {
        mock_id: sitting.id,
        answered_count: sitting.answers.filter((answer) => answer.selectedOption !== null).length,
        question_count: sitting.answers.length,
      }

      if (sitting.status === 'completed') {
        analytics.track('mock_finished', data)
      } else {
        analytics.track('mock_unfinished', { ...data, reason })
      }
    })
  }

  // Bootstrap has already converted interrupted active sittings to unfinished.
  observeTerminal('recovered_on_launch')

  const subscriptions = [
    learner.startMock.onFulfill.subscribe(({ payload: id }) => {
      analytics.run(() => {
        const sitting = learner()?.mockSittings.find((item) => item.id === id)

        if (sitting !== undefined) {
          analytics.write('active-mock', id)

          analytics.track('mock_started', {
            mock_id: id,
            question_count: sitting.answers.length,
          })
        }
      })
    }),
    learner.finishMock.onFulfill.subscribe(() => observeTerminal('exit')),
    learner.expireMock.onFulfill.subscribe(() => observeTerminal('exit')),
    learner.selectMockAnswer.onFulfill.subscribe(() => observeTerminal('exit')),
    learner.navigateMock.onFulfill.subscribe(() => observeTerminal('exit')),
    learner.confirmReplacement.onFulfill.subscribe(() => analytics.write('active-mock', null)),
  ]

  return () => subscriptions.forEach((unsubscribe) => unsubscribe())
}

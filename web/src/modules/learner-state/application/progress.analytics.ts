import type { Analytics } from '../../../shared/analytics'
import type { createLearnerState } from './learner-state.model'

export const observeProgressAnalytics = (
  learner: ReturnType<typeof createLearnerState>,
  analytics: Analytics,
) => {
  const milestones = [25, 50, 75, 100]
  const saved = Number(analytics.read('learned-milestone'))
  const reached = { highest: milestones.includes(saved) ? saved : 0 }

  const observe = (isBaseline: boolean) => {
    analytics.run(() => {
      const totals = learner.progress.totals()

      milestones.forEach((milestone) => {
        if (
          milestone > reached.highest &&
          totals.total > 0 &&
          totals.statuses.learned * 100 >= milestone * totals.total
        ) {
          reached.highest = milestone

          if (!isBaseline) {
            analytics.track(`learning_reached_${milestone}`, {
              learned_count: totals.statuses.learned,
              total_questions: totals.total,
              basis: 'learned',
            })
          }
        }
      })

      analytics.write('learned-milestone', String(reached.highest))
    })
  }

  // Existing and imported progress is a baseline, never a new achievement.
  observe(true)

  const subscriptions = [
    learner.recordStudyAnswer.onFulfill.subscribe(() => observe(false)),
    learner.finishMock.onFulfill.subscribe(() => observe(false)),
    learner.expireMock.onFulfill.subscribe(() => observe(false)),
    learner.selectMockAnswer.onFulfill.subscribe(() => observe(false)),
    learner.navigateMock.onFulfill.subscribe(() => observe(false)),
    learner.confirmReplacement.onFulfill.subscribe(() => {
      reached.highest = 0

      observe(true)
    }),
  ]

  return () => subscriptions.forEach((unsubscribe) => unsubscribe())
}

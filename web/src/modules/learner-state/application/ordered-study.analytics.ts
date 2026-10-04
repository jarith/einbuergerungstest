import type { Analytics } from '../../../shared/analytics'
import type { createStudySession, StudyMode } from './ordered-study.model'

export const createOrderedStudyAnalytics = (analytics: Analytics) => {
  const started = new WeakSet<ReturnType<typeof createStudySession>>()

  return (
    session: ReturnType<typeof createStudySession>,
    mode: StudyMode,
    groupId: string | null,
    getAppMode: () => 'web' | 'pwa',
  ) => {
    if (mode !== 'sequential') {
      return () => undefined
    }

    return session.subscribe((answers) => {
      analytics.run(() => {
        if (answers.size === 0) {
          started.delete(session)
        } else if (!started.has(session)) {
          started.add(session)

          analytics.track(`learning_started_${getAppMode()}`, {
            scope: groupId === null ? 'all' : 'group',
            group_id: groupId ?? undefined,
          })
        }
      })
    })
  }
}

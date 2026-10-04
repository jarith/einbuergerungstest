import type { createLearnerState } from '../../modules/learner-state'
import type { Analytics } from '../../shared/analytics'

export const observeLocalizationAnalytics = (
  learner: ReturnType<typeof createLearnerState>,
  analytics: Analytics,
) => {
  const preference = { language: learner()?.preferences.language }

  if (preference.language !== undefined) {
    analytics.track('language_preference_observed', {
      language: preference.language,
      ui_language: preference.language,
    })
  }

  const changed = () => {
    analytics.run(() => {
      const language = learner()?.preferences.language

      if (language !== undefined && language !== preference.language) {
        analytics.track('language_preference_changed', {
          previous_language: preference.language,
          language,
          ui_language: language,
        })

        preference.language = language
      }
    })
  }

  const subscriptions = [
    learner.updatePreferences.onFulfill.subscribe(changed),
    learner.confirmReplacement.onFulfill.subscribe(changed),
  ]

  return () => subscriptions.forEach((unsubscribe) => unsubscribe())
}

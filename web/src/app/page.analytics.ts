import { createUmamiAnalytics } from '../shared/analytics'
import { getAppMode, observePwaAnalytics } from './offline/pwa.analytics'

// Also used by prerendered public pages; never imports learner state or the router.
export const startPageAnalytics = () => {
  const analytics = createUmamiAnalytics(() => ({
    app_mode: getAppMode(),
    ui_language: document.documentElement.lang === 'de' ? 'de' : 'en',
  }))

  const stopPwa = analytics.run(() => {
    if (getAppMode() === 'web') {
      analytics.track('site_visited', { entry_path: location.pathname })
    }

    return observePwaAnalytics(analytics)
  })

  return {
    analytics,
    dispose: () => {
      stopPwa?.()

      analytics.dispose()
    },
  }
}

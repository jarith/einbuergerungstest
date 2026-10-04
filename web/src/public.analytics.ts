import { startPageAnalytics } from './app/page.analytics'

const analytics = startPageAnalytics()

if (import.meta.hot) {
  import.meta.hot.dispose(analytics.dispose)
}

import type { Analytics } from '../../shared/analytics'

export const getAppMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && navigator.standalone === true)
    ? 'pwa'
    : 'web'

export const observePwaAnalytics = (analytics: Analytics) => {
  const media = window.matchMedia('(display-mode: standalone)')
  const observed = new Set<'open' | 'install'>()

  const opened = () => {
    analytics.run(() => {
      if (getAppMode() !== 'pwa' || observed.has('open')) {
        return
      }

      observed.add('open')

      const firstObserved = analytics.read('pwa-opened') === null

      analytics.track('pwa_opened', { first_observed: firstObserved })

      if (firstObserved) {
        analytics.write('pwa-opened', 'true')

        analytics.track('pwa_first_opened', { detection: 'standalone' })
      }
    })
  }

  const installed = () => {
    analytics.run(() => {
      if (!observed.has('install')) {
        observed.add('install')

        analytics.track('pwa_installed', { detection: 'appinstalled' })
      }
    })
  }

  window.addEventListener('appinstalled', installed)

  media.addEventListener('change', opened)

  opened()

  return () => {
    window.removeEventListener('appinstalled', installed)

    media.removeEventListener('change', opened)
  }
}

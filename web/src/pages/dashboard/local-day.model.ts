import { action, atom, withConnectHook, wrap } from '@reatom/core'

type DayTimer = { current?: ReturnType<typeof setTimeout> }

/** Refresh on local midnight and after suspension; disconnect with the dashboard. */
export const createLocalDay = () =>
  atom(new Date(), 'dashboard.localDay').extend(
    withConnectHook((day) => {
      const timer: DayTimer = {}
      const events = new AbortController()

      const refresh = wrap(
        action(() => {
          clearTimeout(timer.current)

          const now = new Date()
          const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

          day.set(now)

          timer.current = setTimeout(refresh, midnight.getTime() - now.getTime())
        }, 'dashboard.refreshLocalDay'),
      )

      window.addEventListener('focus', refresh, { signal: events.signal })

      window.addEventListener('pageshow', refresh, { signal: events.signal })

      document.addEventListener('visibilitychange', refresh, { signal: events.signal })

      refresh()

      return () => {
        clearTimeout(timer.current)

        events.abort()
      }
    }),
  )

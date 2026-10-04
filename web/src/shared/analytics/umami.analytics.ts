export type AnalyticsData = Readonly<Partial<Record<string, string | number | boolean>>>

type UmamiTracker = Readonly<{
  track: (name: string, data: AnalyticsData) => Promise<void> | void
}>

type AnalyticsEvent = Readonly<{ name: string; data: AnalyticsData }>

type DeliveryState = {
  timer: ReturnType<typeof setTimeout> | undefined
  waitingSince: number
  disposed: boolean
}

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

export const createUmamiAnalytics = (getContext: () => AnalyticsData) => {
  const script = document.querySelector<HTMLScriptElement>('#umami-script')
  const enabled = script?.dataset['domains']?.split(',').includes(location.hostname) ?? false
  const memory = new Map<string, string>()
  const queue: AnalyticsEvent[] = []
  const delivery: DeliveryState = { timer: undefined, waitingSince: 0, disposed: false }

  // Analytics errors must never escape into a business action or its subscriber.
  const run = <Result>(operation: () => Result): Result | undefined => {
    if (!enabled || delivery.disposed) {
      return undefined
    }

    try {
      return operation()
    } catch {
      // Tracking is best effort, including when browser storage is unavailable.
      return undefined
    }
  }

  const flush = () => {
    delivery.timer = undefined

    run(() => {
      const tracker = window.umami

      if (tracker === undefined) {
        if (Date.now() - delivery.waitingSince < 10_000) {
          delivery.timer = setTimeout(flush, 100)
        } else {
          queue.length = 0
        }

        return
      }

      queue.splice(0).forEach(({ name, data }) => {
        run(() => {
          void Promise.resolve(tracker.track(name, data)).catch(() => undefined)
        })
      })
    })
  }

  return {
    enabled,
    run,
    track: (name: string, data: AnalyticsData = {}) => {
      run(() => {
        if (!navigator.onLine || queue.length >= 50) {
          return
        }

        queue.push({ name, data: { ...getContext(), ...data } })

        if (delivery.timer === undefined) {
          delivery.waitingSince = Date.now()

          flush()
        }
      })
    },
    read: (key: string): string | null => {
      const value = run(() => {
        const saved = localStorage.getItem(`einbuergerungstest.analytics.v1.${key}`)

        if (saved !== null) {
          memory.set(key, saved)
        } else {
          memory.delete(key)
        }

        return saved
      })

      return value === undefined ? (memory.get(key) ?? null) : value
    },
    write: (key: string, value: string | null) => {
      run(() => {
        if (value === null) {
          memory.delete(key)

          localStorage.removeItem(`einbuergerungstest.analytics.v1.${key}`)
        } else {
          memory.set(key, value)

          localStorage.setItem(`einbuergerungstest.analytics.v1.${key}`, value)
        }
      })
    },
    dispose: () => {
      delivery.disposed = true

      clearTimeout(delivery.timer)

      queue.length = 0
    },
  }
}

export type Analytics = ReturnType<typeof createUmamiAnalytics>

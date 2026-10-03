import {
  action,
  atom,
  computed,
  effect,
  onEvent,
  withAsync,
  withConnectHook,
  wrap,
} from '@reatom/core'

import { getMissingResources, repairResources, watchServiceWorker } from './service-worker'

type OfflineStatus = 'not-ready' | 'preparing' | 'ready' | 'error' | 'unsupported'

export const createOfflineModel = () => {
  const status = atom<OfflineStatus>('not-ready', 'offline.status')
  const media = window.matchMedia('(display-mode: standalone)')

  const isStandalone = () =>
    media.matches || ('standalone' in navigator && navigator.standalone === true)

  const standalone = atom(isStandalone(), 'offline.standalone').extend(
    withConnectHook(() => {
      const update = wrap(action(() => standalone.set(isStandalone()), 'offline.updateDisplayMode'))

      media.addEventListener('change', update)

      update()

      return () => media.removeEventListener('change', update)
    }),
  )

  const registration = atom<ServiceWorkerRegistration | null>(null, 'offline.registration')
  const missing = atom<readonly string[]>([], 'offline.missing')
  const update = atom(false, 'offline.update')

  const verify = action(async () => {
    const current = registration()
    const worker = current?.active

    update.set(current?.waiting !== null && current?.waiting !== undefined)

    if (worker === undefined || worker === null || worker.state !== 'activated') {
      return
    }

    try {
      const resources = await wrap(getMissingResources(worker))

      missing.set(resources)

      status.set(resources.length === 0 ? 'ready' : 'error')
    } catch {
      status.set('error')
    }
  }, 'offline.verify').extend(withAsync())

  const prepare = action(async () => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) {
      status.set('unsupported')

      return
    }

    status.set('preparing')

    try {
      const existing = await wrap(navigator.serviceWorker.getRegistration('/'))

      const current =
        existing ??
        (await wrap(navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })))

      registration.set(current)

      await wrap(verify())

      if (missing().length > 0 && navigator.serviceWorker.controller !== null) {
        await wrap(repairResources(missing()))

        await wrap(verify())
      }

      // The browser activates updates only after all existing clients have closed.
      // Never send SKIP_WAITING: another window may still have a live mock test.
      if (navigator.onLine) {
        await wrap(current.update())
      }
    } catch {
      if (status() !== 'ready') {
        status.set('error')
      }
    }
  }, 'offline.prepare').extend(withAsync())

  return computed(() => status(), 'offline').extend(
    withConnectHook(() => {
      const observers = effect(() => {
        const current = registration()

        if (current === null) {
          return undefined
        }

        return watchServiceWorker(
          current,
          wrap(() => {
            void verify()
          }),
          wrap(action(() => status.set('error'), 'offline.installFailed')),
        )
      }, 'offline.workerEvents')

      const events = effect(() => {
        onEvent(window, 'online', () => {
          void prepare()
        })

        onEvent(window, 'focus', () => {
          void verify()
        })
      }, 'offline.browserEvents')

      const timeout = effect(() => {
        if (status() !== 'preparing') {
          return undefined
        }
        const timer = setTimeout(wrap(action(() => status.set('error'), 'offline.timeout')), 45_000)

        return () => clearTimeout(timer)
      }, 'offline.preparationTimeout')

      void prepare()

      return () => {
        timeout.unsubscribe()

        observers.unsubscribe()

        events.unsubscribe()
      }
    }),
    () => ({
      standalone,
      missing,
      update,
      prepare,
      pending: computed(() => prepare.pending() > 0, 'offline.pending'),
    }),
  )
}

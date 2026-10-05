import {
  abortVar,
  action,
  atom,
  computed,
  effect,
  isAbort,
  onEvent,
  sleep,
  withAbort,
  withAsync,
  withConnectHook,
  wrap,
} from '@reatom/core'

import { getMissingResources, repairResources, watchServiceWorker } from './service-worker'

type OfflineStatus = 'not-ready' | 'preparing' | 'ready' | 'unverified' | 'error' | 'unsupported'

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
  const update = atom<'none' | 'available' | 'error'>('none', 'offline.update')
  const visible = atom(document.visibilityState === 'visible', 'offline.visible')
  const verificationError = atom<Error | null>(null, 'offline.verificationError')

  const verify = action(async () => {
    const current = registration()
    const worker = current?.active

    if (current?.waiting) {
      update.set('available')
    } else if (update() === 'available') {
      update.set('none')
    }

    if (!visible() || worker === undefined || worker === null || worker.state !== 'activated') {
      return
    }

    // A sleeping worker or interrupted message is not evidence of missing resources.
    // oxlint-disable-next-line app/prefer-array-methods -- Sequential, bounded retries stop on success.
    for (const delay of [0, 1000, 3000]) {
      const subscription = abortVar.subscribe()

      try {
        if (delay > 0) {
          await wrap(sleep(delay))
        }

        const resources = await wrap(getMissingResources(worker, subscription.controller.signal))

        missing.set(resources)

        verificationError.set(null)

        status.set(resources.length === 0 ? 'ready' : 'error')

        return
      } catch (error) {
        if (isAbort(error)) {
          return
        }

        verificationError.set(
          error instanceof Error
            ? error
            : new Error('Offline verification failed.', { cause: error }),
        )
      } finally {
        subscription.unsubscribe()
      }
    }

    if (missing().length === 0) {
      status.set('unverified')
    }
  }, 'offline.verify').extend(withAsync(), withAbort())

  const prepare = action(async () => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) {
      status.set('unsupported')

      return
    }

    if (status() !== 'ready') {
      status.set('preparing')
    }

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
        try {
          await wrap(current.update())

          update.set(current.waiting === null ? 'none' : 'available')
        } catch (error) {
          if (!isAbort(error)) {
            update.set('error')
          }
        }
      }
    } catch (error) {
      if (isAbort(error)) {
        return
      }

      if (status() !== 'ready') {
        status.set('error')
      }
    }
  }, 'offline.prepare').extend(withAsync(), withAbort())

  const resume = action(() => {
    visible.set(document.visibilityState === 'visible')

    if (!visible()) {
      verify.abort()

      return
    }

    if (registration()?.active?.state === 'activated') {
      void verify()
    } else {
      void prepare()
    }
  }, 'offline.resume')

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
          wrap(
            action(() => {
              if (current.active?.state === 'activated') {
                update.set('error')

                void verify()
              } else {
                status.set('error')
              }
            }, 'offline.installFailed'),
          ),
        )
      }, 'offline.workerEvents')

      const events = effect(() => {
        onEvent(window, 'online', () => {
          void prepare()
        })

        onEvent(window, 'focus', resume)

        onEvent(window, 'pageshow', resume)

        onEvent(document, 'visibilitychange', resume)
      }, 'offline.browserEvents')

      const timeout = effect(() => {
        if (status() !== 'preparing' || !visible()) {
          return undefined
        }

        const timer = setTimeout(
          wrap(action(() => status.set('unverified'), 'offline.timeout')),
          45_000,
        )

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
      verificationError,
      prepare,
      pending: computed(() => prepare.pending() > 0 || verify.pending() > 0, 'offline.pending'),
    }),
  )
}

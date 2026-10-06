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

import { isStandalone } from './app-mode'
import {
  getMissingResources,
  getWorkerVersion,
  repairResources,
  watchServiceWorker,
} from './service-worker'

type OfflineStatus = 'not-ready' | 'preparing' | 'ready' | 'unverified' | 'error' | 'unsupported'

export const createOfflineModel = (isRestartBlocked: () => boolean) => {
  const status = atom<OfflineStatus>('not-ready', 'offline.status')
  const media = window.matchMedia('(display-mode: standalone)')

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
  const online = atom(navigator.onLine, 'offline.online')
  const updateChecked = atom(false, 'offline.updateChecked')
  const checkingUpdate = atom(false, 'offline.checkingUpdate')
  const updateRequested = atom(false, 'offline.updateRequested')
  const verificationError = atom<Error | null>(null, 'offline.verificationError')
  const controller = atom(navigator.serviceWorker?.controller ?? null, 'offline.controller')
  const activatedWorker = atom<ServiceWorker | null>(null, 'offline.activatedWorker')
  const restartRequired = atom(false, 'offline.restartRequired')

  const applyUpdate = action(async () => {
    if (
      applyUpdate.pending() > 0 ||
      !navigator.onLine ||
      !updateChecked() ||
      !visible() ||
      isRestartBlocked()
    ) {
      return
    }

    const waiting = registration()?.waiting

    if (waiting === null || waiting === undefined) {
      return
    }

    waiting.postMessage('ACTIVATE_UPDATE')

    // Coalesce lifecycle events while the worker asks every app window whether
    // activation is safe. A later foreground event retries a vetoed activation.
    await wrap(sleep(2500))
  }, 'offline.applyUpdate').extend(withAsync())

  const checkForUpdate = action(async () => {
    if (!navigator.onLine || !visible() || !standalone()) {
      return
    }

    updateRequested.set(true)

    if (checkingUpdate()) {
      return
    }

    checkingUpdate.set(true)

    try {
      // A foreground event may arrive after the current request has already
      // fetched the old worker. Retain it and check again once that request ends.
      while (updateRequested() && navigator.onLine && visible() && standalone()) {
        updateRequested.set(false)

        await wrap(registration()?.update())

        const active = registration()?.active

        if (active !== undefined && active !== null) {
          const version = await wrap(getWorkerVersion(active))

          if (version !== null && version !== import.meta.env['VITE_APP_VERSION']) {
            restartRequired.set(true)
          }
        }

        if (registration()?.waiting) {
          update.set('available')
        }

        updateChecked.set(!updateRequested())
      }
    } catch (error) {
      if (!isAbort(error)) {
        update.set('error')
      }
    } finally {
      checkingUpdate.set(false)
    }
  }, 'offline.checkForUpdate').extend(withAsync())

  const verify = action(async () => {
    const current = registration()
    const worker = current?.active

    activatedWorker.set(worker?.state === 'activated' ? worker : null)

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
    if (!standalone() || !location.pathname.startsWith('/pwa/')) {
      return
    }

    if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) {
      status.set('unsupported')

      return
    }

    if (status() !== 'ready') {
      status.set('preparing')
    }

    try {
      const existing = await wrap(navigator.serviceWorker.getRegistration('/pwa/'))

      const current =
        existing?.scope === new URL('/pwa/', location.origin).href
          ? existing
          : await wrap(navigator.serviceWorker.register('/pwa/sw.js', { updateViaCache: 'none' }))

      registration.set(current)

      await wrap(verify())

      // An unrecoverable asset from the old release must not block its replacement.
      await wrap(checkForUpdate())

      if (navigator.onLine && missing().length > 0 && navigator.serviceWorker.controller !== null) {
        await wrap(repairResources(missing()))

        await wrap(verify())
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
    online.set(navigator.onLine)

    updateChecked.set(false)

    visible.set(document.visibilityState === 'visible')

    if (!visible()) {
      verify.abort()

      return
    }

    if (registration()?.active?.state === 'activated') {
      void verify()

      void checkForUpdate()
    } else {
      void prepare()
    }
  }, 'offline.resume')

  return computed(() => status(), 'offline').extend(
    withConnectHook(() => {
      if (!standalone() || !('serviceWorker' in navigator)) {
        return undefined
      }

      const observers = effect(() => {
        const current = registration()

        if (current === null) {
          return
        }

        const stopWatching = watchServiceWorker(
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

        abortVar.subscribe(stopWatching)
      }, 'offline.workerEvents')

      const events = effect(() => {
        onEvent(window, 'online', () => {
          online.set(true)

          void prepare()
        })

        onEvent(window, 'offline', () => {
          online.set(false)

          updateChecked.set(false)
        })

        onEvent(window, 'focus', resume)

        onEvent(window, 'pageshow', resume)

        onEvent(document, 'visibilitychange', resume)

        onEvent(navigator.serviceWorker, 'message', (event: MessageEvent<unknown>) => {
          if (event.data === 'CAN_ACTIVATE_UPDATE') {
            event.ports[0]?.postMessage(navigator.onLine && !isRestartBlocked())
          }
        })

        onEvent(navigator.serviceWorker, 'controllerchange', () => {
          const previous = controller()
          const next = navigator.serviceWorker.controller

          controller.set(next)

          activatedWorker.set(next?.state === 'activated' ? next : null)

          if (previous !== null && previous !== next) {
            restartRequired.set(true)
          }
        })
      }, 'offline.browserEvents')

      const updates = effect(() => {
        if (visible() && online() && updateChecked() && !isRestartBlocked()) {
          if (restartRequired()) {
            // controllerchange can fire during activation. Reloading then can
            // strand WebKit's new document with an activating worker forever.
            // verify() observes statechange and makes activation reactive.
            if (activatedWorker() !== null && activatedWorker() === controller()) {
              location.reload()
            }
          } else if (update() === 'available') {
            void applyUpdate()
          }
        }
      }, 'offline.automaticUpdate')

      const timeout = effect(() => {
        if (status() !== 'preparing' || !visible()) {
          return
        }

        const timer = setTimeout(
          wrap(action(() => status.set('unverified'), 'offline.timeout')),
          45_000,
        )

        // Reatom effects dispose through abort, not returned cleanup functions.
        abortVar.subscribe(() => clearTimeout(timer))
      }, 'offline.preparationTimeout')

      void prepare()

      return () => {
        timeout.unsubscribe()

        observers.unsubscribe()

        events.unsubscribe()

        updates.unsubscribe()
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

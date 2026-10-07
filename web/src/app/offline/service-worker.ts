export const getMissingResources = (
  worker: ServiceWorker,
  signal?: AbortSignal,
): Promise<string[]> =>
  new Promise((resolve, reject) => {
    signal?.throwIfAborted()

    const channel = new MessageChannel()

    const cleanup = () => {
      clearTimeout(timeout)

      channel.port1.close()

      signal?.removeEventListener('abort', cancel)
    }

    const cancel = () => {
      cleanup()

      reject(
        signal?.reason instanceof Error
          ? signal.reason
          : new DOMException('Offline verification was cancelled.', 'AbortError'),
      )
    }

    const timeout = setTimeout(() => {
      cleanup()

      reject(new Error('Offline cache verification timed out. Reconnect and retry.'))
    }, 10_000)

    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      cleanup()

      const data = event.data

      if (
        Array.isArray(data) &&
        // oxlint-disable-next-line app/no-runtime-typeof -- Validate the worker message boundary.
        data.every((entry): entry is string => typeof entry === 'string')
      ) {
        resolve(data)
      } else {
        reject(new Error('Offline resources could not be verified. Reconnect and retry.'))
      }
    }

    signal?.addEventListener('abort', cancel, { once: true })

    try {
      worker.postMessage('CHECK_OFFLINE', [channel.port2])
    } catch (error) {
      cleanup()

      reject(new Error('Could not contact the offline worker.', { cause: error }))
    }
  })

export const confirmWorkerActivation = async (worker: ServiceWorker, signal: AbortSignal) => {
  if (worker.state === 'activated') {
    return true
  }

  if (worker.state !== 'activating' || navigator.serviceWorker.controller !== worker) {
    return false
  }

  // WebKit can leave the page's worker object in "activating" after a reload.
  // A message reply only proves the worker is alive. A fetch event is dispatched
  // after activation completes, so require a response only this worker produces.
  try {
    const url = new URL('/pwa/offline-ready', location.origin)

    url.searchParams.set('check', crypto.randomUUID())

    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
    })

    return (
      response.status === 204 &&
      response.headers.get('X-Offline-Worker') === worker.scriptURL &&
      navigator.serviceWorker.controller === worker
    )
  } catch {
    signal.throwIfAborted()

    return false
  }
}

export const watchServiceWorker = (
  registration: ServiceWorkerRegistration,
  changed: () => void,
  failed: () => void,
) => {
  const lifecycle = new AbortController()
  const options = { signal: lifecycle.signal }

  const observe = () => {
    // A cold launch can find a worker already waiting or activating.
    const worker = registration.installing ?? registration.waiting ?? registration.active

    if (worker === null || worker.state === 'activated') {
      return
    }

    worker.addEventListener(
      'statechange',
      () => {
        if (worker.state === 'redundant') {
          failed()
        } else if (worker.state === 'installed') {
          // The statechange event can arrive before registration.waiting has
          // been assigned. Read the registration in the next browser task.
          setTimeout(() => {
            if (!lifecycle.signal.aborted) {
              changed()
            }
          }, 0)
        } else {
          changed()
        }
      },
      options,
    )
  }

  registration.addEventListener('updatefound', observe, options)

  navigator.serviceWorker.addEventListener('controllerchange', changed, options)

  observe()

  return () => lifecycle.abort()
}

export const repairResources = async (urls: readonly string[]) => {
  await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(new URL(url, location.origin), { cache: 'reload' })

      if (!response.ok) {
        throw new Error(`Could not prepare ${url}. Reconnect and retry.`)
      }

      // Consume the body before checking the repaired Workbox cache.
      await response.arrayBuffer()
    }),
  )
}

export const getWorkerVersion = (worker: ServiceWorker): Promise<string | null> =>
  new Promise((resolve) => {
    const channel = new MessageChannel()

    const finish = (version: string | null) => {
      clearTimeout(timeout)

      channel.port1.close()

      resolve(version)
    }

    const timeout = setTimeout(() => finish(null), 2000)

    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      // oxlint-disable-next-line app/no-runtime-typeof -- Validate the worker message boundary.
      finish(typeof event.data === 'string' ? event.data : null)
    }

    worker.postMessage('GET_VERSION', [channel.port2])
  })

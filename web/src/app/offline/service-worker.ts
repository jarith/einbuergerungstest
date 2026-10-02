export const getMissingResources = (worker: ServiceWorker): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    const timeout = setTimeout(() => {
      channel.port1.close()

      reject(new Error('Offline cache verification timed out. Reconnect and retry.'))
    }, 10_000)

    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      clearTimeout(timeout)

      channel.port1.close()

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

    worker.postMessage('CHECK_OFFLINE', [channel.port2])
  })

export const watchServiceWorker = (
  registration: ServiceWorkerRegistration,
  changed: () => void,
  failed: () => void,
) => {
  const lifecycle = new AbortController()
  const options = { signal: lifecycle.signal }

  const observe = () => {
    const worker = registration.installing

    if (worker === null) {
      return
    }

    worker.addEventListener(
      'statechange',
      () => {
        if (worker.state === 'redundant') {
          failed()
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

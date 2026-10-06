// This script runs in the waiting worker. Unresponsive clients veto activation:
// a suspended window may still own an unfinished mock test.
/// <reference lib="webworker" />

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This classic script is only loaded by a service worker.
const worker = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self))

// Unlike message events, fetch events wait for activation to finish. This
// uncached response lets a controlled page confirm activation independently of
// a stale ServiceWorker.state. There is deliberately no network resource here.
worker.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (
    event.request.method === 'GET' &&
    url.origin === worker.location.origin &&
    url.pathname === '/pwa/offline-ready'
  ) {
    event.respondWith(
      new Response(null, {
        status: 204,
        headers: { 'X-Offline-Worker': worker.location.href, 'Cache-Control': 'no-store' },
      }),
    )
  }
})

/** @returns {Promise<boolean>} */
const approveUpdate = (/** @type {WindowClient} */ client) =>
  new Promise((resolve) => {
    const channel = new MessageChannel()

    const finish = (/** @type {boolean} */ approved) => {
      clearTimeout(timeout)

      channel.port1.close()

      resolve(approved)
    }

    const timeout = setTimeout(() => finish(false), 2000)

    channel.port1.onmessage = (reply) => finish(reply.data === true)

    client.postMessage('CAN_ACTIVATE_UPDATE', [channel.port2])
  })

worker.addEventListener('message', (event) => {
  if (event.data === 'GET_VERSION') {
    event.ports[0]?.postMessage('APP_BUILD_ID')

    return
  }

  if (event.data !== 'ACTIVATE_UPDATE') {
    return
  }

  event.waitUntil(
    (async () => {
      const clients = await worker.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const windows = clients.filter((client) => new URL(client.url).pathname.startsWith('/pwa/'))

      const approvals = await Promise.all(windows.map(approveUpdate))

      if (windows.length > 0 && approvals.every((approved) => approved)) {
        await worker.skipWaiting()
      }
    })(),
  )
})

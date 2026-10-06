// This script runs in the waiting worker. Unresponsive clients veto activation:
// a suspended window may still own an unfinished mock test.
/// <reference lib="webworker" />

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This classic script is only loaded by a service worker.
const worker = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self))

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

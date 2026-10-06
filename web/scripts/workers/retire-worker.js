// Replace the old root-scoped cache with network delivery. Retain a minimal
// launch bridge because installed iOS apps can keep their original start URL.
/// <reference lib="webworker" />

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This classic script is only loaded by a service worker.
const worker = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self))

worker.addEventListener('install', (event) => {
  event.waitUntil(worker.skipWaiting())
})

worker.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await worker.clients.claim()

      const clients = await worker.clients.matchAll({ type: 'window' })

      clients.forEach((client) => {
        const path = new URL(client.url).pathname

        // Old releases cannot answer an update-safety handshake. Their mock
        // URLs are the conservative boundary until the user next navigates.
        if (!path.startsWith('/mock-test/') && !path.startsWith('/pwa/')) {
          // Do not hold activation open while navigating: the navigation's
          // fetch event waits for this worker to finish activating.
          void client.navigate(client.url).catch(() => undefined)
        }
      })
    })(),
  )
})

worker.addEventListener('message', (event) => {
  if (event.data === 'GET_VERSION') {
    event.ports[0]?.postMessage('legacy-launch-bridge')
  }
})

worker.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.origin !== worker.location.origin) {
    return
  }

  if (url.pathname === '/pwa-legacy-launch.js') {
    event.respondWith(
      new Response(
        `
      const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
      if (installed) {
        location.replace('/pwa' + location.pathname + location.search + location.hash);
      } else {
        document.body.textContent = 'An internet connection is required to use this website.';
      }
    `,
        { headers: { 'Content-Type': 'application/javascript' } },
      ),
    )

    return
  }

  if (event.request.mode === 'navigate' && !url.pathname.startsWith('/pwa/')) {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Einbürgerungstest Berlin</title><body><p>Opening app…</p><script src="/pwa-legacy-launch.js"></script></body></html>',
            {
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Security-Policy': "default-src 'none'; script-src 'self'",
              },
            },
          ),
      ),
    )

    return
  }
})

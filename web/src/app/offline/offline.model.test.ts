import { afterEach, expect, test, vi } from 'vitest'

import { createOfflineModel } from './offline.model'

const createWorker = (state: ServiceWorkerState) =>
  Object.assign(new EventTarget(), {
    state,
    scriptURL: 'https://example.test/pwa/sw.js',
    postMessage(message: string, ports: MessagePort[]) {
      ports[0]?.postMessage(message === 'CHECK_OFFLINE' ? [] : 'current-release')
    },
  })

const createEnvironment = (
  active: ReturnType<typeof createWorker>,
  installing: ReturnType<typeof createWorker> | null = null,
) => {
  const registration = Object.assign(new EventTarget(), {
    scope: 'https://example.test/pwa/',
    active,
    installing,
    waiting: null,
    update: () => Promise.resolve(),
  })

  const serviceWorker = Object.assign(new EventTarget(), {
    controller: active,
    getRegistration: () => Promise.resolve(registration),
  })

  const reload = vi.fn<() => void>()

  vi.stubEnv('PROD', true)

  vi.stubEnv('VITE_APP_VERSION', 'current-release')

  vi.stubGlobal('location', {
    origin: 'https://example.test',
    pathname: '/pwa/settings',
    reload,
  })

  vi.stubGlobal('navigator', { onLine: true, serviceWorker })

  vi.stubGlobal('document', Object.assign(new EventTarget(), { visibilityState: 'visible' }))

  vi.stubGlobal(
    'window',
    Object.assign(new EventTarget(), {
      isSecureContext: true,
      matchMedia: () => Object.assign(new EventTarget(), { matches: true }),
    }),
  )

  vi.stubGlobal('fetch', () => Promise.resolve(new Response(null, { status: 404 })))

  return { registration, serviceWorker, reload }
}

afterEach(() => {
  vi.unstubAllGlobals()

  vi.unstubAllEnvs()
})

test.each([
  { responds: true, expected: 'ready' },
  { responds: false, expected: 'activation-pending' },
])(
  'an activating worker with a complete cache reports $expected',
  async ({ responds, expected }) => {
    const worker = createWorker('activating')

    const { reload } = createEnvironment(worker)

    vi.stubGlobal('fetch', () =>
      Promise.resolve(
        new Response(null, {
          status: responds ? 204 : 404,
          headers: responds ? { 'X-Offline-Worker': worker.scriptURL } : {},
        }),
      ),
    )

    const offline = createOfflineModel(() => false)
    const subscription = offline.subscribe()

    try {
      await vi.waitFor(() => expect(offline()).toBe(expected))

      expect(offline.missing()).toEqual([])
      expect(reload).not.toHaveBeenCalled()
    } finally {
      subscription()
    }
  },
)

test('an automatic restart waits for the replacement controller to finish activation', async () => {
  const original = createWorker('activated')
  const replacement = createWorker('installing')

  const { registration, serviceWorker, reload } = createEnvironment(original, replacement)

  const offline = createOfflineModel(() => false)
  const subscription = offline.subscribe()

  try {
    await vi.waitFor(() => expect(offline()).toBe('ready'))
    await vi.waitFor(() => expect(offline.pending()).toBe(false))

    Object.defineProperty(registration, 'installing', { value: null })

    registration.active = replacement
    replacement.state = 'activating'
    serviceWorker.controller = replacement

    replacement.dispatchEvent(new Event('statechange'))

    serviceWorker.dispatchEvent(new Event('controllerchange'))

    // Let the model's scheduled effects observe controllerchange.
    await new Promise<void>((resolve) => setImmediate(resolve))

    expect(reload).not.toHaveBeenCalled()

    replacement.state = 'activated'

    replacement.dispatchEvent(new Event('statechange'))

    await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce())
  } finally {
    subscription()
  }
})

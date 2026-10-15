import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from 'undici'
import { afterEach, beforeEach, expect, onTestFinished, test, vi } from 'vitest'

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

  return { registration, serviceWorker, reload }
}

const createNetwork = () => {
  const previousDispatcher = getGlobalDispatcher()
  const network = new MockAgent()

  network.disableNetConnect()

  setGlobalDispatcher(network)

  onTestFinished(async () => {
    setGlobalDispatcher(previousDispatcher)

    await network.close()
  })

  return network
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
  })

  vi.setSystemTime(new Date('2026-10-15T10:00:00Z'))

  // Node's native AbortSignal.timeout uses an internal timer outside Vitest's
  // clock. Keep its browser-boundary semantics on the same controlled clock.
  vi.spyOn(AbortSignal, 'timeout').mockImplementation((delay) => {
    const controller = new AbortController()

    setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), delay)

    return controller.signal
  })
})

afterEach(() => {
  vi.unstubAllGlobals()

  vi.unstubAllEnvs()

  vi.restoreAllMocks()

  vi.useRealTimers()
})

const interceptActivation = (network: MockAgent) =>
  network.get('https://example.test').intercept({
    path: /^\/pwa\/offline-ready\?check=[^&]+$/,
    method: 'GET',
    headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
  })

test.each([
  {
    evidence: 'identified activation response',
    status: 204,
    headers: { 'X-Offline-Worker': 'https://example.test/pwa/sw.js' },
    expected: 'ready',
  },
  {
    evidence: 'missing activation response',
    status: 404,
    headers: {},
    expected: 'activation-pending',
  },
  {
    evidence: 'activation response without worker identity',
    status: 204,
    headers: {},
    expected: 'activation-pending',
  },
  {
    evidence: 'activation response identifying another worker',
    status: 204,
    headers: { 'X-Offline-Worker': 'https://example.test/pwa/another-worker.js' },
    expected: 'activation-pending',
  },
  {
    evidence: 'identified response without the activation status',
    status: 200,
    headers: { 'X-Offline-Worker': 'https://example.test/pwa/sw.js' },
    expected: 'activation-pending',
  },
])(
  'an activating worker with $evidence and a complete cache reports $expected',
  async ({ status, headers, expected }) => {
    const network = createNetwork()
    const worker = createWorker('activating')

    const { reload } = createEnvironment(worker)

    interceptActivation(network).reply(status, '', { headers })

    const offline = createOfflineModel(() => false)
    const subscription = offline.subscribe()

    try {
      await vi.waitFor(() => expect(offline()).toBe(expected))

      network.assertNoPendingInterceptors()

      expect(offline.missing()).toEqual([])
      expect(reload).not.toHaveBeenCalled()
    } finally {
      subscription()
    }
  },
)

test('an automatic restart waits for the replacement controller to finish activation', async () => {
  const network = createNetwork()
  const original = createWorker('activated')
  const replacement = createWorker('installing')

  const { registration, serviceWorker, reload } = createEnvironment(original, replacement)

  interceptActivation(network).reply(404, '').persist()

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

    await vi.waitFor(() => expect(offline()).toBe('activation-pending'))

    expect(reload).not.toHaveBeenCalled()

    replacement.state = 'activated'

    replacement.dispatchEvent(new Event('statechange'))

    await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce())
  } finally {
    subscription()
  }
})

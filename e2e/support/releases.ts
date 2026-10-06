import { test as base } from '@playwright/test'
import { generateSW } from 'workbox-build'

import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Release = 'release-a' | 'release-b'

type Deployment = Readonly<{
  origin: string
  publish: (release: Release) => void
  failDownloads: (fail: boolean) => void
  workerRequests: () => number
  failedRequests: () => number
  serveLegacyWorker: () => void
  setConnected: (connected: boolean) => void
}>

const contentTypes = new Map([
  ['.html', 'text/html'],
  ['.js', 'application/javascript'],
  ['.css', 'text/css'],
  ['.json', 'application/json'],
  ['.webmanifest', 'application/manifest+json'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
])

export const test = base.extend<
  { deployment: Deployment; setOffline: (offline: boolean) => Promise<void> },
  { releases: string }
>({
  setOffline: async ({ browserName, context, deployment }, use) => {
    if (browserName !== 'webkit') {
      await use((offline) => context.setOffline(offline))

      return
    }

    // Playwright #42775: WebKit setOffline rejects even literal SW responses.
    // Cut the real HTTP transport and emulate only the browser connectivity
    // signal, so WebKit still exercises actual worker navigation/cache behavior.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: () => localStorage.getItem('e2e-connectivity') !== 'offline',
      })
    })

    await use(async (offline) => {
      deployment.setConnected(!offline)

      await Promise.all(
        context
          .pages()
          .filter((page) => page.url().startsWith(deployment.origin))
          .map(async (page) => {
            await page.evaluate((disconnected) => {
              localStorage.setItem('e2e-connectivity', disconnected ? 'offline' : 'online')

              window.dispatchEvent(new Event(disconnected ? 'offline' : 'online'))
            }, offline)
          }),
      )
    })
  },
  releases: [
    // oxlint-disable-next-line no-empty-pattern -- Playwright requires a destructured fixture parameter.
    async ({}, use) => {
      const directory = await mkdtemp(join(tmpdir(), 'citizenship-releases-'))

      try {
        // Two complete production builds: changed JS, HTML, integrity hashes and
        // generated workers. No interception or mocking of the worker lifecycle.
        for (const release of ['release-a', 'release-b']) {
          execFileSync('yarn', ['workspace', '@einbuergerungstest/web', 'build'], {
            cwd: fileURLToPath(new URL('../../', import.meta.url)),
            env: {
              ...process.env,
              APP_BUILD_OUTPUT: join(directory, release),
              VITE_APP_VERSION: release,
            },
            stdio: 'pipe',
          })
        }

        // Reproduce the old root-scoped, cache-first deployment contract.
        await generateSW({
          globDirectory: join(directory, 'release-a'),
          globPatterns: ['**/*.{html,js,css,json,webp,png,svg,woff2,webmanifest}'],
          globIgnores: ['sw.js', 'pwa/**'],
          swDest: join(directory, 'legacy', 'sw.js'),
          navigateFallback: '/app.html',
          modifyURLPrefix: { '': '/' },
          clientsClaim: true,
          skipWaiting: false,
          sourcemap: false,
        })

        await use(directory)
      } finally {
        await rm(directory, { recursive: true, force: true })
      }
    },
    { scope: 'worker', timeout: 120_000 },
  ],
  deployment: async ({ releases }, use) => {
    const state = {
      release: 'release-a',
      fail: false,
      workers: 0,
      failed: 0,
      legacy: false,
      connected: true,
    }

    const headers = await readFile(join(releases, 'release-a', '_headers'), 'utf8')
    const policy = headers.match(/^  Content-Security-Policy: (.+)$/m)?.[1]
    const redirects = await readFile(join(releases, 'release-a', '_redirects'), 'utf8')

    const appPaths = redirects.split('\n').flatMap((line) => {
      const [source, target, status] = line.split(' ')

      return source !== undefined && target === '/app' && status === '200'
        ? [new RegExp(`^${source.replace(/:[^/]+/g, '[^/]+')}$`)]
        : []
    })

    const server = createServer((request, response) => {
      if (!state.connected) {
        request.socket.destroy()

        return
      }

      void (async () => {
        const url = new URL(request.url ?? '/', 'http://localhost')

        if (url.pathname === '/pwa/sw.js') {
          state.workers += 1
        }

        if (state.fail && url.pathname.startsWith('/assets/main-')) {
          state.failed += 1

          response.writeHead(503).end()

          return
        }

        const pathname = appPaths.some((pattern) => pattern.test(url.pathname))
          ? '/app.html'
          : url.pathname.endsWith('/')
            ? `${url.pathname}index.html`
            : url.pathname

        try {
          const directory =
            state.legacy && (pathname === '/sw.js' || pathname.startsWith('/workbox-'))
              ? 'legacy'
              : state.release

          const body = await readFile(join(releases, directory, pathname))

          if (policy !== undefined) {
            response.setHeader('Content-Security-Policy', policy)
          }

          response
            .writeHead(200, {
              'Content-Type': contentTypes.get(extname(pathname)) ?? 'application/octet-stream',
              'Cache-Control': 'public, max-age=0, must-revalidate, no-transform',
            })
            .end(body)
        } catch {
          response.writeHead(404).end()
        }
      })()
    })

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

    const address = server.address()

    // oxlint-disable-next-line app/no-runtime-typeof -- Narrow the Node TCP server address union.
    if (address === null || typeof address === 'string') {
      throw new Error('The release server must listen on a local TCP port.')
    }

    try {
      await use({
        origin: `http://127.0.0.1:${address.port}`,
        publish: (release) => {
          state.release = release
          state.legacy = false
        },
        failDownloads: (fail) => {
          state.fail = fail
        },
        workerRequests: () => state.workers,
        failedRequests: () => state.failed,
        serveLegacyWorker: () => {
          state.legacy = true
        },
        setConnected: (connected) => {
          state.connected = connected
        },
      })
    } finally {
      server.closeAllConnections()

      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
    }
  },
})

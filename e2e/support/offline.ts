/* oxlint-disable typescript/unbound-method -- Inspect the native state getter and invoke it with its receiver. */

import type { Page } from '@playwright/test'

export const exposeStaleActivationState = (page: Page) =>
  page.addInitScript(() => {
    const getState = Object.getOwnPropertyDescriptor(ServiceWorker.prototype, 'state')?.get

    if (getState === undefined) {
      throw new Error('This browser must expose the service worker lifecycle state.')
    }

    Object.defineProperty(ServiceWorker.prototype, 'state', {
      configurable: true,
      get() {
        const state: unknown = getState.call(this)

        return state === 'activated' ? 'activating' : state
      },
    })
  })

// Hold one real cache-check response at the browser message boundary. Application
// verification, worker code, and cache contents remain real.
export const holdNextCacheCheck = (page: Page) =>
  page.evaluateHandle(() => {
    type HeldResponse = { reply?: unknown; destination?: MessagePort }

    const original = ServiceWorker.prototype.postMessage
    const captured = Promise.withResolvers<void>()
    const response: HeldResponse = {}

    ServiceWorker.prototype.postMessage = function (message, transfer) {
      if (
        message !== 'CHECK_OFFLINE' ||
        !Array.isArray(transfer) ||
        !(transfer[0] instanceof MessagePort)
      ) {
        return original.call(this, message, Array.isArray(transfer) ? { transfer } : transfer)
      }

      ServiceWorker.prototype.postMessage = original
      response.destination = transfer[0]

      const channel = new MessageChannel()

      channel.port1.onmessage = (event: MessageEvent<unknown>) => {
        response.reply = event.data

        channel.port1.close()

        captured.resolve()
      }

      original.call(this, message, { transfer: [channel.port2] })
    }

    return {
      captured: captured.promise,
      release: async () => {
        await captured.promise
        response.destination?.postMessage(response.reply)
        response.destination?.close()

        // Drain the posted-message queue before assertions on its visible effect.
        await new Promise<void>((resolve) => {
          const barrier = new MessageChannel()

          barrier.port1.onmessage = () => {
            barrier.port1.close()

            barrier.port2.close()

            resolve()
          }

          barrier.port2.postMessage(null)
        })
      },
    }
  })

export const evictCachedBank = (page: Page) =>
  page.evaluateHandle(async () => {
    const entries = await Promise.all(
      (await caches.keys()).map(async (name) => {
        const cache = await caches.open(name)

        const key = (await cache.keys()).find(
          (request) => new URL(request.url).pathname === '/questionbank-berlin.json',
        )

        const response = key === undefined ? undefined : await cache.match(key)

        if (key === undefined || response === undefined) {
          return null
        }

        await cache.delete(key)

        return { cache, key, response }
      }),
    )

    if (entries.every((entry) => entry === null)) {
      throw new Error('The prepared bank must exist before cache eviction.')
    }

    return {
      restore: async () => {
        await Promise.all(
          entries.map(async (entry) => {
            if (entry !== null) {
              await entry.cache.put(entry.key, entry.response.clone())
            }
          }),
        )
      },
    }
  })

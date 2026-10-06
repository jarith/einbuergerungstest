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

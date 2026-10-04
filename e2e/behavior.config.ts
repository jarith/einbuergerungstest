import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

import { fileURLToPath } from 'node:url'

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'behavior/steps/**/*.ts',
  outputDir: '.features-gen/behavior',
})

export default defineConfig({
  testDir,
  outputDir: 'test-results/behavior',
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  globalTimeout: 5 * 60_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4174',
    timezoneId: 'Europe/Berlin',
  },
  webServer: {
    command: 'yarn panda:prepare && yarn run -T vite --config e2e/behavior.vite.config.ts',
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    url: 'http://127.0.0.1:4174/e2e/behavior/',
    reuseExistingServer: false,
  },
})

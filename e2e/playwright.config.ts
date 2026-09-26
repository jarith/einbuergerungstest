import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

import { fileURLToPath } from 'node:url'

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
  outputDir: '.features-gen',
})

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  webServer: {
    command: 'yarn preview --port 4173 --strictPort',
    cwd: fileURLToPath(new URL('../web', import.meta.url)),
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})

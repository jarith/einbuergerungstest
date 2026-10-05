import { defineConfig, devices } from '@playwright/test'

import { fileURLToPath } from 'node:url'

export default defineConfig({
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  outputDir: 'test-results/browser',
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    timezoneId: 'Europe/Berlin',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'smoke', testDir: './journeys', grep: /@smoke/, use: devices['Desktop Chrome'] },
    {
      name: 'e2e',
      testDir: './journeys',
      grepInvert: /@smoke/,
      dependencies: ['smoke'],
      use: devices['Desktop Chrome'],
    },
    { name: 'ui', testDir: './tests', use: devices['Desktop Chrome'] },
    { name: 'webkit', testDir: './tests', grep: /@webkit/, use: devices['Desktop Safari'] },
    { name: 'touch-android', testDir: './touch', use: devices['Pixel 7'] },
    { name: 'touch-ios', testDir: './touch', use: devices['iPhone 13'] },
  ],
  webServer: {
    command: 'yarn preview --port 4173 --strictPort',
    cwd: fileURLToPath(new URL('../web', import.meta.url)),
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})

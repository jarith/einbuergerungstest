import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './updates',
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  workers: 1,
  timeout: 45_000,
  outputDir: 'test-results/updates',
  reporter: [['list']],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'updates-chromium', use: devices['Desktop Chrome'] },
    { name: 'updates-webkit', use: devices['Desktop Safari'] },
  ],
})

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:6006',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  webServer: {
    command: 'yarn run -T vite preview --config vite.preview.config.ts',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: false,
  },
})

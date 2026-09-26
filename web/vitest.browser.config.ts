import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.browser.test.tsx'],
    allowOnly: (process.env['CI'] ?? '') === '',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      trace: { mode: 'retain-on-failure', tracesDir: 'test-results/browser-traces' },
      instances: [{ browser: 'chromium' }],
    },
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['web/src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
    exclude: ['**/*.browser.test.*', '**/node_modules/**'],
    restoreMocks: true,
    allowOnly: (process.env['CI'] ?? '') === '',
  },
})

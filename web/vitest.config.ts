import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    restoreMocks: true,
    sequence: { shuffle: true },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/index.ts', 'src/**/*.d.ts'],
      reporter: [['text', { skipFull: false }], 'html', 'json'],
    },
    allowOnly: (process.env['CI'] ?? '') === '',
  },
})

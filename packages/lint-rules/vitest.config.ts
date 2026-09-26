import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/fixtures/**'],
    fileParallelism: false,
    globals: true,
  },
})

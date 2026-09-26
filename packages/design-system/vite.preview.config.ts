import { defineConfig } from 'vite'

export default defineConfig({
  build: { outDir: 'storybook-static' },
  preview: {
    host: '127.0.0.1',
    port: 6006,
    strictPort: true,
  },
})

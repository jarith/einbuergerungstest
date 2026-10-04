import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { publicPages } from './scripts/public-pages.ts'

export default defineConfig({
  plugins: [react(), publicPages()],
  appType: 'mpa',
  build: { rolldownOptions: { input: ['index.html', 'app.html'] } },
  publicDir: 'public',
})

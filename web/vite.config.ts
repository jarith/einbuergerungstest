import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { getBuildOutput, getBuildVersion } from './scripts/build-version.ts'
import { publicPages } from './scripts/public-pages.ts'

export default defineConfig({
  plugins: [react(), publicPages()],
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(getBuildVersion()) },
  appType: 'mpa',
  build: {
    outDir: getBuildOutput(),
    emptyOutDir: true,
    rolldownOptions: { input: ['index.html', 'app.html'] },
  },
  publicDir: 'public',
})

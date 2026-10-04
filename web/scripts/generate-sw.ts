import { generateSW } from 'workbox-build'

import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { getLearnerPathPattern } from '../src/app/seo/site.ts'

const output = fileURLToPath(new URL('../dist/', import.meta.url))

await mkdir(`${output}/locales`, { recursive: true })

await Promise.all(
  ['en', 'de'].map((language) =>
    copyFile(
      new URL(`../src/app/i18n/${language}.json`, import.meta.url),
      `${output}/locales/${language}.json`,
    ),
  ),
)

const result = await generateSW({
  globDirectory: output,
  globPatterns: ['**/*.{html,js,css,woff2,woff,ttf,json,webp,png,svg,ico,webmanifest}'],
  globIgnores: ['sw.js', 'workbox-*.js', 'offline-check.js'],
  swDest: `${output}/sw.js`,
  importScripts: ['offline-check.js'],
  navigateFallback: '/app.html',
  navigateFallbackAllowlist: [getLearnerPathPattern()],
  navigateFallbackDenylist: [/^\/images\//, /^\/assets\//, /^\/locales\//, /\.[^/]+$/],
  skipWaiting: false,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  sourcemap: false,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  dontCacheBustURLsMatching: /^assets\/.+-[\w-]+\./,
  manifestTransforms: [
    async (entries) => {
      const manifest = await Promise.all(
        entries.map(async (entry) => ({
          ...entry,
          // Integrity lets Workbox safely repair an evicted precache entry from the network.
          integrity: `sha384-${createHash('sha384')
            .update(await readFile(`${output}/${entry.url}`))
            .digest('base64')}`,
        })),
      )

      // Verification uses the exact generated precache, never a hand-maintained bank manifest.
      // This script is part of the worker's own installed script graph, not an app resource.
      await writeFile(
        `${output}/offline-check.js`,
        `
const resources = ${JSON.stringify(manifest.map(({ url, revision }) => ({ url, revision })))};
self.addEventListener('message', (event) => {
  if (event.data !== 'CHECK_OFFLINE' || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const missing = (await Promise.all(resources.map(async (entry) => {
        const key = new URL(entry.url, self.location.href);
        if (entry.revision) key.searchParams.set('__WB_REVISION__', entry.revision);
        return (await caches.match(key.href))?.ok ? null : entry.url;
      }))).filter((url) => url !== null);
      event.ports[0].postMessage(missing);
    } catch {
      event.ports[0].postMessage(null);
    }
  })());
});
`,
      )

      return { manifest, warnings: [] }
    },
  ],
})

if (result.warnings.length > 0) {
  throw new Error(`Offline precache is incomplete: ${result.warnings.join('\n')}`)
}

console.log(`Precached ${result.count} resources (${result.size} bytes).`)

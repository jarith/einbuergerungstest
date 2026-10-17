import { generateSW } from 'workbox-build'

import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

import { getLearnerPathPattern } from '../src/app/seo/site.ts'
import {
  isJsonValue,
  parseQuestionBank,
} from '../src/modules/question-bank/domain/question-bank.ts'
import { getBuildOutput, getBuildVersion } from './build-version.ts'

const output = getBuildOutput()

const bankValue: unknown = JSON.parse(await readFile(`${output}/questionbank-berlin.json`, 'utf8'))

if (!isJsonValue(bankValue)) {
  throw new Error('The offline question bank must contain valid JSON data.')
}

const bank = parseQuestionBank(bankValue)

const requiredResources = [
  'questionbank-berlin.json',
  ...['en', 'de', 'ru'].map(
    (language) => `cheat-sheet/einbuergerungstest-berlin-cheat-sheet-${language}.pdf`,
  ),
  ...bank.questions.flatMap((question) => [
    ...(question.question_image_resource === undefined ? [] : [question.question_image_resource]),
    ...(question.question_image_variants ?? []).map((variant) => variant.resource),
  ]),
]

await mkdir(`${output}/locales`, { recursive: true })

await Promise.all(
  ['en', 'de'].map((language) =>
    copyFile(
      new URL(`../src/app/i18n/${language}.json`, import.meta.url),
      `${output}/locales/${language}.json`,
    ),
  ),
)

await mkdir(`${output}/pwa`, { recursive: true })

await writeFile(
  `${output}/pwa/update-worker.js`,
  (await readFile(new URL('./workers/update-worker.js', import.meta.url), 'utf8')).replace(
    "'APP_BUILD_ID'",
    JSON.stringify(getBuildVersion()),
  ),
)

await copyFile(new URL('./workers/retire-worker.js', import.meta.url), `${output}/sw.js`)

const result = await generateSW({
  globDirectory: output,
  globPatterns: ['**/*.{html,js,css,woff2,woff,ttf,json,webp,png,svg,ico,webmanifest,pdf}'],
  globIgnores: ['sw.js', 'workbox-*.js', 'offline-check.js', 'pwa/**'],
  swDest: `${output}/pwa/sw.js`,
  importScripts: ['/pwa/offline-check.js', '/pwa/update-worker.js'],
  navigateFallback: '/app.html',
  navigateFallbackAllowlist: [new RegExp(`^/pwa${getLearnerPathPattern().source.slice(1)}`)],
  navigateFallbackDenylist: [/^\/images\//, /^\/assets\//, /^\/locales\//, /\.[^/]+$/],
  skipWaiting: false,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  sourcemap: false,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  dontCacheBustURLsMatching: /^assets\/.+-[\w-]+\./,
  manifestTransforms: [
    async (entries) => {
      const included = new Set(entries.map((entry) => entry.url))
      const omitted = requiredResources.filter((url) => !included.has(url))

      if (omitted.length > 0) {
        throw new Error(`Offline precache is missing question resources: ${omitted.join(', ')}`)
      }

      const manifest = await Promise.all(
        entries.map(async (entry) => ({
          ...entry,
          url: `/${entry.url}`,
          // Integrity lets Workbox safely repair an evicted precache entry from the network.
          integrity: `sha384-${createHash('sha384')
            .update(await readFile(`${output}/${entry.url}`))
            .digest('base64')}`,
        })),
      )

      // Verification uses the exact generated precache, never a hand-maintained bank manifest.
      // This script is part of the worker's own installed script graph, not an app resource.
      await writeFile(
        `${output}/pwa/offline-check.js`,
        `
const resources = ${JSON.stringify(manifest.map(({ url, revision }) => ({ url, revision })))};
self.addEventListener('message', (event) => {
  if (event.data !== 'CHECK_OFFLINE' || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const cacheNames = (await caches.keys()).filter((name) => name.startsWith('workbox-precache-') && name.endsWith(self.registration.scope));
      const missing = (await Promise.all(resources.map(async (entry) => {
        const key = new URL(entry.url, self.location.href);
        if (entry.revision) key.searchParams.set('__WB_REVISION__', entry.revision);
        const matches = await Promise.all(cacheNames.map((cacheName) => caches.match(key.href, { cacheName })));
        return matches.some((response) => response?.ok) ? null : entry.url.slice(1);
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

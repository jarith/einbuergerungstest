import { createServer } from 'vite'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import type { renderPublic } from '../src/app/seo/render-public.tsx'
import { getSiteOrigin } from '../src/app/seo/site.ts'

const output = fileURLToPath(new URL('../dist/', import.meta.url))

const template = await readFile(`${output}/index.html`, 'utf8')

// Opt in only on the production deployment; previews and local builds stay noindex.
const isIndexable = process.env['SITE_INDEXABLE'] === 'true'

const server = await createServer({ server: { middlewareMode: true, hmr: false } })

try {
  // SAFETY: This module is our statically checked renderer; Vite erases its export types.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Restore the known local module contract.
  const renderer = (await server.ssrLoadModule('/src/app/seo/render-public.tsx')) as {
    renderPublic: typeof renderPublic
  }

  await mkdir(`${output}/en`, { recursive: true })

  await Promise.all([
    writeFile(`${output}/index.html`, renderer.renderPublic(template, 'de', isIndexable)),
    writeFile(`${output}/en/index.html`, renderer.renderPublic(template, 'en', isIndexable)),
    writeFile(
      `${output}/404.html`,
      template
        .replace(
          '<!--public-head-->',
          '<title>Seite nicht gefunden · Page not found</title><meta name="robots" content="noindex, follow" />',
        )
        .replace(
          '<!--public-content-->',
          '<main><h1>Seite nicht gefunden</h1><p lang="en">Page not found.</p><p><a href="/">Zur Startseite</a> · <a href="/en/" lang="en">English homepage</a></p></main>',
        ),
    ),
    writeFile(
      `${output}/robots.txt`,
      `User-agent: *\nAllow: /\n${isIndexable ? `\nSitemap: ${getSiteOrigin()}/sitemap.xml\n` : ''}`,
    ),
    writeFile(
      `${output}/sitemap.xml`,
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${isIndexable ? ['/', '/en/'].map((path) => `<url><loc>${getSiteOrigin()}${path}</loc></url>`).join('') : ''}</urlset>\n`,
    ),
  ])
} finally {
  await server.close()
}

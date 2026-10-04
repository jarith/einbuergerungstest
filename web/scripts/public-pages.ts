import type { Plugin } from 'vite'

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { renderPublic } from '../src/app/seo/render-public.tsx'
import { getPublicLanguage, isLearnerPath } from '../src/app/seo/site.ts'

export const publicPages = (): Plugin => ({
  name: 'public-pages',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const url = new URL(request.url ?? '/', 'http://localhost')

      if (url.pathname === '/en') {
        response.writeHead(308, { Location: `/en/${url.search}` }).end()

        return
      }

      if (url.pathname === '/en/') {
        request.url = `/index.html${url.search}`
      } else if (isLearnerPath(url.pathname)) {
        request.url = `/app.html${url.search}`
      }

      next()
    })
  },
  async transformIndexHtml(html, context) {
    if (context.server === undefined || context.path === '/app.html') {
      return html
    }

    const url = new URL(context.originalUrl ?? context.path, 'http://localhost')
    const language = getPublicLanguage(url.pathname) ?? 'de'

    // SAFETY: This module is our statically checked renderer; Vite erases its export types.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Restore the known local module contract.
    const renderer = (await context.server.ssrLoadModule('/src/app/seo/render-public.tsx')) as {
      renderPublic: typeof renderPublic
    }

    return renderer.renderPublic(html, language, false)
  },
  async configurePreviewServer(server) {
    const headers = await readFile(
      resolve(server.config.root, server.config.build.outDir, '_headers'),
      'utf8',
    )

    const policy = headers.match(/^  (Content-Security-Policy(?:-Report-Only)?): (.+)$/m)

    if (policy?.[1] === undefined || policy[2] === undefined) {
      throw new Error('The production build must declare a Content Security Policy in _headers.')
    }
    const [, policyHeader, policyValue] = policy

    const notFound = await readFile(
      resolve(server.config.root, server.config.build.outDir, '404.html'),
    )

    server.middlewares.use((request, response, next) => {
      // Exercise the deployed policy, including service workers and offline HTML, in preview.
      response.setHeader(policyHeader, policyValue)

      const url = new URL(request.url ?? '/', 'http://localhost')

      if (url.pathname === '/en' || url.pathname === '/index.html') {
        response
          .writeHead(308, { Location: `${url.pathname === '/en' ? '/en/' : '/'}${url.search}` })
          .end()

        return
      }

      if (isLearnerPath(url.pathname)) {
        request.url = `/app.html${url.search}`
      } else if (getPublicLanguage(url.pathname) === null && !/\.[^/]+$/.test(url.pathname)) {
        response
          .writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Robots-Tag': 'noindex, follow',
          })
          .end(notFound)

        return
      }

      next()
    })
  },
})

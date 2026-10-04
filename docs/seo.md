# Public pages and search indexing

The canonical origin is `https://einbuergerungstest.jarith.dev`. The only indexable pages
in this first release are `/` (German) and `/en/` (English). They contain the Berlin
introduction, question coverage, translations, offline preparation, installation, and
device-local progress information. The existing learner dashboard is `/dashboard`; the
installed app opens there. Study and other learner URLs retain their paths.

## Build and indexing policy

```sh
# Local builds and previews: every HTML document is noindex.
mise exec -- yarn workspace @einbuergerungstest/web build

# Set this only in the custom-domain production deployment environment.
SITE_INDEXABLE=true mise exec -- yarn workspace @einbuergerungstest/web build
```

The build prerenders both language pages with React and the shared design system. The
delivered public pages load only a small analytics entry and the Umami tracker; they do
not initialize the learner application, question bank, learner storage, localization
preferences, or service worker. See [analytics coverage](analytics.md). Language links
perform normal navigation and work with JavaScript disabled. Training links load the
existing app. The renderer supplies one title, a language-specific description, absolute
canonical, reciprocal `de`/`en`/`x-default` alternates, and Open Graph and Twitter
metadata with a 1200 × 630 PNG share image.

`app.html` contains `noindex, follow` before JavaScript runs. The app updates its existing
HTML title on route/language changes. Learner routes, progress, settings, question
history, and individual mock-test sessions are excluded from the sitemap. The generated
`404.html` also contains `noindex, follow`.

Production builds generate a sitemap containing exactly the two public canonical URLs.
Preview builds generate an empty sitemap and no sitemap declaration in robots.txt.
Crawling stays allowed so crawlers can read the HTML `noindex` directives; robots.txt is
not used as a substitute for preventing indexing. Keep `SITE_INDEXABLE` unset in preview
environments, even when they build the production branch. If the provider serves one
production artifact under additional hostnames, enforce their indexing policy at the host
as described below.

## Hosting contract

Deploy the entire `web/dist` directory atomically. The Vite preview middleware implements
this contract for local verification; **it does not configure a production provider**. The
provider must implement the same routing:

- Serve `/` from `index.html` and `/en/` from `en/index.html`.
- Permanently redirect `/en` to `/en/` and `/index.html` to `/`, preserving queries.
- Rewrite learner paths to `app.html` with status 200. The exact allowlist is defined in
  `web/src/app/seo/site.ts`; it includes dashboard, study, mock-test, progress, and
  settings routes. Do not use a site-wide fallback to the public homepage.
- Return `404.html` with HTTP 404 for unknown public paths. Missing assets must also
  return 404, never an HTML app shell with status 200.
- Redirect the **production** provider hostname to
  `https://einbuergerungstest.jarith.dev`, preserving the full path and query, with status
  301 or 308. Keep preview hostnames separate.
- On preview hosts, add `X-Robots-Tag: noindex, follow` to responses as an additional
  host-level safeguard. Never inherit `SITE_INDEXABLE=true` into preview builds.
- Serve HTML, `sw.js`, `offline-check.js`, and the manifest with revalidation/no-cache
  headers. Hashed assets can use immutable caching. Keep older hashed assets while clients
  might still use them.

The service worker precaches both public pages and the learner shell. Its navigation
fallback applies only to learner paths, so offline `/en/` stays English and the public
homepage never substitutes for a training screen.

## Verification and launch work

Implementation checks:

- [x] Prerendered German/English content and route-specific public metadata.
- [x] Storage-independent public content and direct training access.
- [x] Preview-safe build defaults, sitemap, robots.txt, noindex learner/error HTML.
- [x] One title through learner navigation and localized settings.
- [x] Public and learner service-worker navigation remain separate.
- [x] Browser coverage in `e2e/tests/seo.test.ts` and the offline journey.
- [ ] Configure and verify provider redirects, production routing, and preview headers.
- [ ] Deploy an indexable build on the custom domain.
- [ ] Verify the domain property in Google Search Console using the account's DNS token.
- [ ] Inspect `/` and `/en/` with URL Inspection after launch. Check fetched and rendered
      content, canonical selection, crawl availability, and absence of production noindex.
- [ ] Submit `https://einbuergerungstest.jarith.dev/sitemap.xml` in Search Console.

The repository does not currently identify the hosting provider/default hostname or
contain deployment credentials. Provider configuration and Search Console verification
need that information and account access; local checks do not establish live indexing.

This follows Google's guidance on
[JavaScript SEO and SPA error pages](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[separate multilingual URLs](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites),
and
[sitemap discovery](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

# Serving the question bank and images as static assets

Research date: 2026-09-27. Scope: the Vite web app and its offline requirement. The audit
below describes the implementation before the static-asset simplification; the final PWA
work remains a later task.

## Recommendation

Keep the authored `web/public/questionbank-berlin.json` and `web/public/images/` paths.
Let Vite copy them into `dist`, and let the static host serve them. Fetch the JSON
**once** with the browser's `fetch()` and `Response.json()`; use the existing domain
parser for the data. Resolve each relative image path against the bank URL, then give the
resulting URLs to a normal HTML `<img>` with `src`, `srcset`, `sizes`, `width`, `height`,
and suitable `alt` text. Let the browser fetch and decode an illustration when it is
shown. This preserves the paths required by [Task 01](../../tasks/01-resources.md) and
[ADR 0002](../adr/0002-offline-question-bank-and-localization.md), while removing the
custom Vite asset plugin, `webp-wasm`, binary WebP parser, and startup download/decode of
every image. Vite's `public` assets are already served at the site root in development and
copied to the build output unchanged; use `import.meta.env.BASE_URL` when constructing the
bank URL for a deployment under a subpath. Sources:
[Vite static assets](https://vite.dev/guide/assets),
[Vite public base path](https://vite.dev/guide/build#public-base-path),
[Fetch JSON](https://developer.mozilla.org/en-US/docs/Web/API/Response/json),
[relative URL resolution](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references).

For the later PWA work, generate a content-revisioned service-worker precache from the
**built `dist` files**. Include the JSON and WebP paths explicitly; Workbox's default
`globPatterns` cover JS, WASM, CSS, and HTML, but not JSON or WebP. `generateSW` is the
simplest Workbox route when no custom service-worker logic is required. Its generated
revisions already track changes to stable file names, so no hand-maintained bank revision
query, asset list, or image-byte hash is needed for the cache. Sources:
[Workbox `generateSW`](https://developer.chrome.com/docs/workbox/precaching-with-workbox),
[Workbox build options](https://developer.chrome.com/docs/workbox/modules/workbox-build),
[Workbox precaching and revisions](https://developer.chrome.com/docs/workbox/modules/workbox-precaching).

## What the previous code did

- `web/vite.config.ts` called `createQuestionBankAssets()` at config load and emitted a
  second JSON manifest. That script read every WebP file, parsed its headers, decoded it
  using `webp-wasm`, and hashed it. **`webp-wasm` ran at build/dev-server startup, not in
  the browser.** The generated `question-bank-assets.json` was never consumed by a service
  worker.
- At runtime, `fetchQuestionBank()` fetched the JSON and then fetched and called the
  browser's `createImageBitmap()` on all 35 unique image files before the app became
  ready.
  A custom question-bank loader added a stateful promise wrapper around that operation;
  the follow-up review removed it. The bank was 313,197 bytes and
  the image directory is 4.32 MiB in this checkout. This made every learner pay for all
  illustration variants before opening even a text-only question.
- The former `?revision=` URLs used the bank's date string. The manifest's content hash
  appeared in `cacheVersion`, but **not in the requested asset URLs**. If bytes changed
  without updating that date, these URLs did not provide content-based invalidation. This
  is an inference from the repository code, consistent with
  [HTTP cache-busting guidance](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control#caching_static_assets_with_cache_busting).

## Why native serving is enough

- The current Vite build targets modern browsers, including Safari 16.4 or newer by
  default; WebP has broad support across current major browsers. The browser's `<img>`
  natively requests and decodes WebP, so a WebAssembly decoder and an up-front
  `createImageBitmap()` check are unnecessary for display. Sources:
  [Vite browser compatibility](https://vite.dev/guide/build#browser-compatibility),
  [MDN image formats: WebP](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#webp_image),
  [HTML `<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img).
- `srcset` and `sizes` let the browser select among the existing width variants. Explicit
  dimensions reserve layout space; `loading="lazy"` is useful for images below the
  viewport, but the currently visible question can load normally. Source:
  [HTML `<img>`: responsive images and loading](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img).
- The domain parser retains the useful data contract at load time. Verify the referenced
  public images as part of release preparation; the browser need not download and decode
  them all just to make the question bank usable. Vite copies public assets directly
  ([Vite static assets](https://vite.dev/guide/assets)).

## JSON placement choice

| Choice                              | Mechanism and cost                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Fit here                                                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep JSON in `public`               | Vite copies the `.json` file unchanged. One `fetch()` plus `Response.json()` loads a separately addressable bank; existing relative `images/...` paths resolve against that URL. There is one small asynchronous loading/error state. [Vite](https://vite.dev/guide/assets), [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [URL resolution](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references). | **Simplest under this repo's Task 01 and ADR commitments**: no authored-file relocation, no image path rewrite, and the JSON remains a published static file. |
| Move JSON under `src` and import it | Vite supports a direct JSON module import, so no fetch/loading state is needed. The data becomes part of a JS module/chunk rather than a separately served `.json` file; the authored file and path references would need to move or be adapted. [Vite JSON imports](https://vite.dev/guide/features#json), [Vite asset imports](https://vite.dev/guide/assets).                                                                                                        | Attractive if the separate JSON URL and existing `public` path are dropped. It is a larger change than the public-file option under the current plan.         |

Vite's general preference for imported assets does not preclude `public`: its docs
identify `public` as appropriate when exact file names must be retained or when one does
not want to import assets to get their URLs. The bank's relative image paths and Task 01's
preserved runtime URLs are such a case. Source:
[Vite: choosing imports versus `public`](https://vite.dev/guide/assets#the-public-directory).

## Caching and offline details

- For an ordinary static deployment, send `Cache-Control: no-cache` on `index.html` and
  stable-name public JSON/WebP files so browsers may store them but revalidate before
  reuse. The Vite-produced hashed JS/CSS can use a long `max-age` and `immutable`.
  Configure this at the static host; Vite's `preview` command is only a local preview
  server. Serve the JSON with `application/json` and WebP with `image/webp`; enable HTTP
  compression for JSON/text, while images are already compressed. Sources:
  [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control#caching_static_assets_with_cache_busting),
  [Vite assets and hashes](https://vite.dev/guide/assets),
  [Vite static deployment](https://vite.dev/guide/static-deploy),
  [MDN common MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types),
  [MDN HTTP compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression).
- The `?revision=` parameter was removed ahead of the generated precache. Workbox routes
  normally match the original asset URL and only ignore `utm_*` and `fbclid` query
  parameters by default; `?revision=` would need explicit routing configuration to match a
  precached unqualified path. Workbox can generate a content hash for each stable-name
  file itself. Source:
  [Workbox precache URL matching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching#incoming_requests_for_precached_files).
- The product requirements call for every illustration to work offline, and
  [ADR 0002](../adr/0002-offline-question-bank-and-localization.md) goes further by
  demanding **every responsive variant** offline. Workbox advises against precaching all
  variants of responsive images because a device will usually use only one, but that is
  general performance guidance, not a correctness rule. With the current 35 files totaling
  4.32 MiB, explicitly precaching all of them is the straightforward way to honor the ADR
  and make any `srcset` choice available offline. If initial download size becomes a
  problem, revisit that ADR and ship one adequate image per illustrated question or add an
  intentional offline fallback; do not silently omit variants while retaining the current
  `srcset`. Sources:
  [Workbox precaching dos and don'ts](https://developer.chrome.com/docs/workbox/precaching-dos-and-donts#dont_precache_responsive_images_or_favicons),
  [HTML `<img>` `srcset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#srcset).
- Keep the service worker's update activation deliberate so a running mock test is not
  replaced mid-session. Workbox's default `generateSW` `skipWaiting: false` supports a
  waiting update. Source:
  [Workbox service worker updates](https://developer.chrome.com/docs/workbox/handling-service-worker-updates).

## Implementation sequence

1. Done: replace the runtime image preflight with resolved URLs rendered through `<img>`;
   retain the bank's domain validation and a small loading/error/retry UI.
2. Done: replace the Vite asset plugin and WebP decoder with Vite's public directory.
   Remove the date query from runtime resource URLs, the custom loader, and the separate
   build validation command.
3. For the later PWA, generate its precache from `dist`, explicitly include JSON and WebP,
   and verify an installed app opens all illustrated questions offline. Set host cache
   headers for stable and hashed paths once the deployment host is chosen.

The first two steps were implemented after the research was written. Task 20 still owns
the service worker and offline verification.

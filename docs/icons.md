# Browser, search, and installed-app icons

The book-and-checkmark identity uses Lucide's `BookOpenCheck`, rendered in the app's green
and cream palette. The source is `web/scripts/icon-artwork.tsx`; generated files are
committed under `web/public`. Lucide's license ships at `/icons/lucide-license.txt`.

| Surface                                  | Asset                                                | Size / behavior                                             |
| ---------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| Modern browser tabs and bookmarks        | `/favicon.svg`                                       | Scalable, rounded tile                                      |
| Browser fallback and automatic discovery | `/favicon.ico`                                       | 16, 32, and 48 px frames                                    |
| Search crawlers and PNG fallback         | `/icons/favicon-96.png`                              | 96 × 96 px, stable URL                                      |
| iPhone / iPad Home Screen                | `/icons/apple-touch-icon.png`                        | 180 × 180 px, opaque; iOS supplies the mask                 |
| PWA default icons                        | `/icons/icon-192.png`, `/icons/icon-512.png`         | 192 / 512 px, `purpose: any`                                |
| Android adaptive PWA icons               | `/icons/maskable-192.png`, `/icons/maskable-512.png` | 192 / 512 px, `purpose: maskable`, opaque with safe padding |

Both HTML entry templates link the ICO, PNG, SVG, Apple touch icon, and manifest before
JavaScript runs. Prerendering preserves those links on both public language pages. The
manifest distinguishes regular icons from maskable icons. Workbox includes the image files
in its generated offline precache.

Regenerate after changing the artwork:

```sh
mise exec -- yarn browser:install
mise exec -- yarn workspace @einbuergerungstest/web icons:generate
mise exec -- yarn workspace @einbuergerungstest/web build
```

Generation uses the existing React, Vite, Lucide, and Playwright dependencies. It is a
manual asset-authoring command, not an extra browser dependency in the production build.
Normal builds copy the checked-in files. If Lucide is upgraded, keep its distributed
license current with the installed package.

Search crawlers must be able to fetch the homepage and PNG/ICO assets. The existing
robots.txt permits this. Production still needs the indexing/deployment configuration in
[SEO](seo.md). Search-result display requires recrawling and is Google's decision; no
favicon declaration guarantees display. Browsers also decide whether icons appear in the
tab, address field, bookmarks, or other browser chrome.

The icon files and installation metadata are browser-tested locally. Actual iOS/Android
Home Screen installation should be smoke-tested on a phone after deployment; existing
installations may retain their previous icon until the platform refreshes it.

References:
[Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search),
[maskable icon safe zone](https://web.dev/articles/maskable-icon), and
[Apple touch icons](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).

# Serve one offline question bank with separate UI localization

Status: Proposed

## Context

The [Berlin question bank](../../web/public/questionbank-berlin.json) contains 310
questions in one roughly 300 KB JSON file. Each question and answer choice keeps its
German exam text beside an English study translation. Thirteen questions reference local
illustrations. Group titles and descriptions have English and German text.

The [requirements](../requirements.md) call for offline access to every question and
illustration, English and German UI, optional English study translations, and progress
that survives reloads. [ADR 0001](./0001-device-local-progress.md) already chooses
device-local progress with manual export and import, without accounts or a backend.

## Decision

### Question bank and delivery

Keep one authored JSON file for the Berlin bank. Filter it in memory for group study and
select from it for mock tests. Splitting this small bank would add loading and update
coordination while offline study and mock tests still need the complete bank. Publish it
as one static asset alongside the separate question images; the source PDF is not an app
asset. Vite serves `web/public` through its `publicDir` setting. Fetch the bank once and
render its relative image paths with native `<img>` `srcset` and `sizes`, so the browser
loads the illustrated question's image when needed. Validate the bank's question IDs,
answer options, translations, and image metadata when loading it, and include the
referenced image files in the deployment.

Give each question a stable, randomly generated `id` of five lowercase letters or digits,
unique within the bank. Use this URL-safe ID directly in all question routes and saved
history, without a section prefix. Keep `section` for general/Berlin classification and
mock sampling. Use `order` (1–310) for display numbering and traversal, independent of
identity; sort by it when loading the bank. The previous `number` and `source_question_id`
fields are removed. IDs are authored once and must not be regenerated when loading or
reordering questions. No legacy ID mapping or history migration is provided.

### Offline access and updates

For the final PWA implementation, use Workbox `generateSW` to build a content-revisioned
precache from Vite's completed `dist` output. Include the app shell, code, styles,
manifest, icons, both UI language catalogs, the JSON bank, and every responsive
illustration variant; configure the generated precache to include `.json` and `.webp`
files explicitly. Workbox tracks file changes, so do not maintain a separate bank asset
manifest or add revision queries to resource URLs. Serve these resources from the cache
when offline. Show that the app is ready for offline use only after the required resources
have been cached successfully. Optimize the illustrations for delivery before shipping
them, since they dominate the initial download. See the
[Workbox precaching guide](https://developer.chrome.com/docs/workbox/modules/workbox-precaching)
and
[Workbox build options](https://developer.chrome.com/docs/workbox/modules/workbox-build).

When a new version is published, prepare its resources before replacing the old cache.
Keep the new worker waiting and apply an available update at a safe point so a live mock
test is not interrupted. Background updates are silent: neither an available version nor a
failed update download displays a notice. Keep using the prepared current copy and reserve
offline notices for preparation or verification of its required resources. Keep learner
data separate from resource caches. A browser tab and an installed PWA use the same
service worker and application logic. The installed iPhone or iPad app needs its own
online preparation because
[WebKit does not copy Safari's local website data into it](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/).

### Learner state

Keep static hosting and no server database. Store attempts, mock-test history, study
positions, and settings in IndexedDB on the device. Load this data when the app starts;
persist changes as the learner makes them, including while offline. Derive question status
and progress totals from recorded attempts instead of saving duplicate totals. Selections
in an unfinished mock test do not become question attempts. Preserve the confirmed export,
import, and reset behavior from ADR 0001. No synchronization queue is needed while
progress remains device-local.

### Localization

Use `i18next` with `react-i18next` for app interface text, with bundled English and German
catalogs available offline. Initialize its language from the saved UI preference; new
learners start in English regardless of browser language. Keep this preference as the
single source of truth when changing languages. Use locale-aware formatting and plural
messages for counts and dates.

Keep question and answer translations beside their German originals in the bank, rather
than moving them into UI message catalogs. Keep each group's existing English
title/description fields and its German title_de/description_de fields. The UI language
selects interface and group text, while the study translation preference independently
controls whether English question text is shown beside German. Hide that control in German
UI without clearing its saved value. A live mock test always displays German question
content; its completed review may show English alongside German in English UI.

## Consequences

The app can be deployed as static files and works without a network after offline
preparation. The complete image set increases the first download, but makes unseen
illustrated questions available offline. Learners transfer or back up progress manually;
there is no automatic cross-device sync, and browser storage can be cleared or evicted. UI
messages and question translations share a language preference and validation process
while remaining in their respective catalog and content records.

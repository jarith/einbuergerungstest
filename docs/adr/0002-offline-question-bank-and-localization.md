# Serve one offline question bank with separate UI localization

Status: Proposed

## Context

The [Berlin question bank](../../web/public/questionbank-berlin.json) contains 310
questions in one roughly 300 KB JSON file. Each question and answer choice keeps its
German exam text beside an English study translation. Thirteen questions reference local
illustrations. The group titles and descriptions currently have only English text.

The [requirements](../requirements.md) call for offline access to every question and
illustration, English and German UI, optional English study translations, and progress
that survives reloads. [ADR 0001](./0001-device-local-progress.md) already chooses
device-local progress with manual export and import, without accounts or a backend.

## Decision

### Question bank and delivery

Keep one authored JSON file for the Berlin bank. Filter it in memory for group study and
select from it for mock tests. Splitting this small bank would add loading and update
coordination while offline study and mock tests still need the complete bank. Publish it
as one versioned static asset alongside the separate question images; the source PDF is
not an app asset. Vite serves `web/public` through its `publicDir` setting. Image paths in
the bank are relative to the bank URL and include responsive WebP variants. Validate the
bank's question IDs, answer options, translations, and image references before publishing
it.

Use a stable question key based on `section` and `source_question_id`, independent of its
display position. Include a bank revision in the published data and record it with
attempts so later content changes can be handled against saved history deliberately.

### Offline access and updates

Use a service worker to precache the app shell, code, styles, manifest, icons, both UI
language catalogs, the entire question bank, and every responsive illustration variant.
Serve these resources from the cache when offline. Show that the app is ready for offline
use only after the required resources have been cached successfully. Optimize the
illustrations for delivery before shipping them, since they dominate the initial download.

When a new version is published, prepare its resources before replacing the old cache.
Apply an available update at a safe point so a live mock test is not interrupted. Keep
learner data separate from resource caches. A browser tab and an installed PWA use the
same service worker and application logic. The installed iPhone or iPad app needs its own
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
than moving them into UI message catalogs. Add German and English fields for each group's
title and description. The UI language selects interface and group text, while the study
translation preference independently controls whether English question text is shown
beside German. Hide that control in German UI without clearing its saved value. A live
mock test always displays German question content; its completed review may show English
alongside German in English UI.

## Consequences

The app can be deployed as static files and works without a network after offline
preparation. The complete image set increases the first download, but makes unseen
illustrated questions available offline. Learners transfer or back up progress manually;
there is no automatic cross-device sync, and browser storage can be cleared or evicted.
Bank revisions and saved history need explicit handling when official question content
changes. UI messages and question translations share a language preference and validation
process while remaining in their respective catalog and content records.

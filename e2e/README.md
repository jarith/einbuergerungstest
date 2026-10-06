# Business specifications, integration drivers, and E2E journeys

Business specifications describe learning, scoring, progress, dates, preferences,
confirmation, and recovery. They must remain valid when the UI, platform, or technology
stack changes. Keep screens, routes, widgets, styles, exact interface copy, storage
formats, and test machinery out of `features/**/*.feature`.

## Commands

Run from the repository root with mise activated, or prefix with `mise exec --`:

| Command                                                  | Coverage                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `yarn test:behavior`                                     | Generate Gherkin and run application integration specifications                       |
| `yarn test:browser`                                      | Focused rendered-component integrations                                               |
| `yarn test:e2e`                                          | Build production app; run two smoke journeys, then two destructive-operation journeys |
| `yarn test:ui`                                           | Presentation and interaction checks, including Android/iPhone touch profiles          |
| `yarn workspace @einbuergerungstest/e2e bddgen`          | Check every business step has an unambiguous implementation                           |
| `yarn workspace @einbuergerungstest/e2e test:e2e:headed` | Run the selected E2E journeys visibly                                                 |
| `yarn browser:install`                                   | Install the pinned Chromium and WebKit browsers                                       |

## Integration specifications

`behavior.config.ts` compiles the feature files using playwright-bdd. Its test-only Vite
server serves `behavior/index.html` on port 4174. The harness loads the actual application
models through module exports that also reference UI components, so server startup runs
`panda:prepare` to generate their style imports even on a clean checkout. The complete
behavior run has a five-minute limit to bound shared startup failures. The harness uses
real IndexedDB; it renders no application screens. Each scenario gets a fresh browser
context, storage, application instances, and controlled clock. A second persistence client
establishes concurrent changes without clicking through another browser window.

The browser is needed by the current storage and lifecycle adapters, not by the business
specification. `behavior/harness.ts`, `behavior/fixtures`, and `behavior/steps` are
replaceable implementation adapters. They call public application actions, observe
results, and arrange external fixtures. They must not implement scoring, progress,
validation, confirmation, or other production rules themselves, or mock application
modules. Raw unsupported/corrupted profile formats belong only in fixture adapters.

Date-boundary specifications use explicit example dates and Europe/Berlin as the test
calendar. They do not depend on the wall-clock date when the suite runs. E2E fixture dates
are relative to the current date.

Business checks for language content are backed by focused `QuestionContent` component
integrations under `web`, so the rendering connection is checked without a full app
journey. Platform installation guidance stays in the browser UI suite. Offline behavior is
covered by the production E2E below because a model harness cannot verify deployed asset
caching.

## Selected production E2E paths

`journeys/*.test.ts` contains one user path per file, with its selection criterion:

| Path                                                                            | Criterion                                             | Smoke |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- | ----- |
| Download backup → import and confirm replacement → restored history/settings    | Irreversible replacement and actual file transfer     | Yes   |
| Prepare online → reopen offline → study an illustrated question → retain answer | Actual service-worker/deployment/network boundary     | Yes   |
| Confirm reset → reopen with erased history                                      | Irreversible deletion                                 | No    |
| Recover original saved data → confirm fresh start → study successfully          | Irreversible replacement and actual recovery download | No    |

Smoke failures prevent the dependent E2E project from running. Each path seeds its own
state, uses accessible roles/labels, waits for observable outcomes, and has no automatic
retries. Fixture code is the only E2E code allowed to arrange IndexedDB directly. Outcomes
are verified through the user flow; exhaustive field combinations and rejection cases
belong in integration specifications. A consumed replacement confirmation cannot erase
subsequent progress; a newly requested import or reset is still allowed.

The offline path verifies a prepared standalone-mode copy, not an actual installed iOS
app. Installation and separate Home Screen storage still need real-device verification.

`test:e2e` and `test:ui` build the app and use production preview on port 4173. Existing
servers are not reused. To rerun a specific test against an existing build:

```sh
yarn workspace @einbuergerungstest/e2e run -T playwright test --project=smoke journeys/backup.test.ts
yarn workspace @einbuergerungstest/e2e run -T playwright test --project=e2e --no-deps journeys/reset.test.ts
```

## UI checks and CI

`tests/**/*.test.ts` owns responsive layout, touch targets, image zoom, concrete keyboard
and focus interactions, date/timer formatting, installation guidance, and deployed
manifest assets. Offline-readiness checks inspect the full cached bank and every
referenced illustration, then exercise delayed verification, stale replies, resume, cache
repair, and update failures against the production build. The `webkit` project runs cases
tagged `@webkit`. These tests may depend on UI or platform details; they are not the
portable business contract. Shared browser helpers live in `support/browser.ts`. Component
colors and visual variants stay in Storybook coverage.

`touch/**/*.test.ts` runs in the `touch-android` (Pixel 7 / Chromium) and `touch-ios`
(iPhone 13 / WebKit) projects. These use touch taps rather than desktop clicks to cover
date clearing, route scroll/focus, active-navigation double taps, history preservation,
test departure, accessible answer groups, target sizes, and appearance metadata. Emulation
cannot verify the installed app's software keyboard, system bars, physical safe-area
insets, or VoiceOver/TalkBack; those remain real-device checks.

`touch/app-base.test.ts` exercises Continue group and Progress → question → study in
standalone and browser modes at phone and tablet widths, including saved positions and
return navigation. `tests/app-links.test.ts` checks rendered learner links across content,
completion, and error states and follows mock submission through review and history. These
catch links escaping `/pwa/`; opening a correctly prefixed URL directly cannot detect that
regression.

CI runs E2E only after business integration and component-browser checks succeed. On pull
requests it selects the four journeys when app, E2E, design-system, dependency/toolchain,
or workflow paths change. The complete suite runs on master pushes. CI runs only on pull
requests and master pushes. No application unit-test requirement is introduced by this
migration.

`.features-gen`, `test-results`, and `playwright-report` are disposable ignored output.
Generation rejects missing/ambiguous steps; CI rejects focused tests. Production-browser
failures retain traces and screenshots. See
[migration and coverage ownership](../docs/bdd-migration.md).

## Automatic deployment updates

Run `yarn test:updates` for the dedicated release-transition suite. It is also included in
`test:ui`, so the existing required browser-UI CI job runs it. Each worker builds two real
production outputs in temporary directories with distinct build IDs, then atomically
switches the files served on the same local origin. The tests use the real generated
workers, precaches, integrity checks, and application code. A generated legacy root worker
reproduces the previous deployment contract for migration tests.

Coverage includes automatic online cold launch and foreground updates with no manual
reload, offline cold launch and reconnect, failed download recovery, preserving study
progress, deferring for a mock test in another window, online-only browser refresh with an
installed PWA on the same origin, legacy root-worker migration, and offline launches from
a retained iOS start URL. Chromium uses native offline emulation. WebKit uses a real
server connection outage plus an emulated `navigator.onLine` signal because Playwright
[issue #42775](https://github.com/microsoft/playwright/issues/42775) rejects even literal
service-worker navigation responses with `setOffline(true)`. This workaround lives only in
the test transport; the app and worker lifecycle are unchanged. Real iPhone Home Screen
installation, OS suspension, and upgrade behavior still require device verification.

`APP_BUILD_OUTPUT` selects the output directory for the Vite, prerender, and worker steps;
it lets the suite build isolated releases without replacing the ordinary preview build.

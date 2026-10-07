# Einbürgerungstest Berlin

A device-local study app for the Berlin citizenship test, with all 310 questions,
English/German UI, timed mock tests, progress backups and offline installation. Built with
React, Reatom, Mantine and Panda.

## Start here

Install [mise](https://mise.jdx.dev/installing-mise.html), then run these commands from
the repository root:

```sh
mise trust mise.toml
mise install --locked
mise exec -- yarn install --immutable
mise exec -- yarn browser:install
mise exec -- yarn dev
```

`mise.toml` and `mise.lock` select and lock Node, Yarn, actionlint, jq, and ShellCheck.
`yarn.lock` locks application dependencies. If mise is activated in your shell, you can
run `yarn` directly. On Linux, `mise exec -- yarn browser:install --with-deps` also
installs the browser's system dependencies.

To update a tool, change its version in `mise.toml`, regenerate `mise.lock` with
`mise lock --platform linux-x64,macos-arm64,macos-x64`, and verify with
`mise install --locked`. For Yarn, record the SHA-256 of the published `yarn.js` in each
platform entry of `mise.lock`; its Aqua recipe does not supply a checksum.

The application listens on all network interfaces at port `5173` and fails if that port is
already in use. Open the Network URL printed by Vite on both your computer and iPhone
while connected to the same Wi-Fi, or use `http://127.0.0.1:5173` on the computer. Offline
PWA testing requires a production build over HTTPS; development does not register a
service worker. Run `yarn storybook` in another terminal for the component workbench at
`http://localhost:6006`. Both commands generate Panda assets before starting and watch
styles during development. Stop the command to stop its processes.

Application logic stays in `web`, browser acceptance tests in `e2e`, and reusable
infrastructure in `packages/*`. All dependencies are declared at the repository root.
Workspace packages use the `@einbuergerungstest/*` scope.

## Commands

Run these from the repository root with mise activated, or prefix a command with
`mise exec --`:

| Command                                                  | Purpose                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `yarn dev`                                               | Develop the application with Vite and Panda watching                         |
| `yarn build`                                             | Build the production application into `web/dist`                             |
| `yarn workspace @einbuergerungstest/web preview`         | Serve an existing production build locally                                   |
| `yarn storybook`                                         | Develop component stories                                                    |
| `yarn workspace @einbuergerungstest/design-system build` | Build the static workbench                                                   |
| `yarn ts:compile`                                        | Check all workspaces, tests, stories and configuration with TypeScript 7     |
| `yarn lint`                                              | Generate Panda helpers, then run Actionlint, ast-grep, and Oxlint            |
| `yarn lint:ast-grep`                                     | Run custom ast-grep rules in every workspace                                 |
| `yarn format:check` / `yarn format`                      | Oxfmt checks / formatting                                                    |
| `yarn test`                                              | Workspace checks, including deterministic mock-paper unit tests              |
| `yarn test:browser`                                      | React/Reatom browser integration tests                                       |
| `yarn test:storybook`                                    | Build and test component stories with Playwright                             |
| `yarn test:behavior`                                     | Run portable business specifications through application integration drivers |
| `yarn test:e2e`                                          | Build and run four selected production E2E journeys                          |
| `yarn test:ui`                                           | Build and run browser presentation and interaction checks                    |
| `yarn panda:prepare`                                     | Regenerate ignored Panda utilities and CSS                                   |
| `yarn browser:install`                                   | Install the pinned Chromium browser                                          |
| `yarn create:package <name>`                             | Create an infrastructure workspace                                           |

`preview` intentionally serves an existing build; run `build` first. Other documented
commands prepare their generated assets. Test servers require free ports: 4173 for E2E,
6006 for Storybook tests, and Vitest's browser-server port for component tests. Stop the
interactive Storybook process before running its Playwright suite.

Formatting follows Groove Forge: two spaces, single quotes, no semicolons, trailing
commas, and a 100-column limit (90 columns for Markdown). Oxfmt handles layout; Oxlint's
Stylistic rules enforce blank lines around multiline statements, declarations, and
standalone calls, with grouped assertions and re-exports kept together. Run `yarn lint` to
check the rules and `yarn format` to apply formatting.

## Guides

- [Application structure and package creation](docs/architecture.md)
- [Mantine/Panda design system](packages/design-system/README.md)
- [Test ownership and CI](docs/testing.md)
- [Toolchain versions and dependency maintenance](docs/toolchain.md)
- [E2E workspace](e2e/README.md)
- [Cloudflare production deployment](docs/deployment.md)
- [Extraction sources and intentional omissions](docs/extraction-sources.md)

GitHub Actions runs build, lint, type, formatting, tooling, business integration,
component-browser, browser UI, Storybook, and selected E2E checks. E2E waits for business
and component integration checks, then runs backup/offline smoke before reset/recovery.
Pull requests select E2E when application or test boundaries change; master pushes run the
complete suite. CI runs only on pull requests and master pushes. Jobs use the locked mise
tools and immutable dependency installs. Master builds upload `web/dist`; production
deploys that same artifact to Cloudflare Pages only after every required CI job succeeds.

The application needs no credentials, server database, or external service. Learner data
stays in IndexedDB on the device. `yarn test:behavior` runs the business Gherkin against
real application models and IndexedDB without rendering app screens. Specs describe domain
behavior; drivers contain platform and implementation details. `yarn test:e2e` covers
backup transfer/replacement, confirmed reset, startup recovery, and offline study against
the production build. `yarn test:ui` owns presentation and concrete browser interactions;
`yarn test:browser` owns focused component integration, and Storybook owns component
visual states. Application unit tests remain outside the delivery scope. See the
[E2E guide](e2e/README.md) and [migration record](docs/bdd-migration.md).

## Offline build and deployment

Run `yarn build` and deploy the entire `web/dist` directory at the root of an HTTPS
origin. The included Cloudflare Pages rules serve the prerendered public pages at `/` and
`/en/`, and rewrite only learner routes to `app.html`. Unknown public paths must return
`404.html` with status 404; serve
asset files with their correct MIME types and real errors for missing files. Builds are
non-indexable by default: set `SITE_INDEXABLE=true` only for custom-domain production.
See the [deployment guide](docs/deployment.md) for the one-time Cloudflare/GitHub setup,
automatic releases, and recovery, and the [SEO guide](docs/seo.md) for indexing.
The included headers require network revalidation; the service worker manages offline
caching. Pages publishes the complete output atomically. Old clients normally use their
precache; an evicted cache can require closing and reopening online after a release.
Localhost preview is also a secure context.

The post-build Workbox `generateSW` step includes HTML, scripts, styles, fonts, manifest,
icons, both generated UI catalogs, the JSON bank and all 35 optimized WebP illustrations.
The worker verifies every entry in that same generated precache before the app says “Ready
offline”. The build validates the complete 310-question bank and rejects any referenced
illustration or responsive variant missing from the precache. An incomplete download or
evicted entry shows an error with retry; Workbox uses integrity checks when repairing
cached resources. A delayed verification retries without reporting missing downloads; if
checks remain unavailable, the app shows a separate verification notice. Returning to the
foreground checks again, and failed updates do not invalidate the current prepared copy.
Development Vite does not register a service worker. Verify offline behavior using the
production preview.

Updates download into the precache and wait until every existing app window closes. Finish
the live mock, close the browser tabs/installed windows and reopen the app to activate an
available update. There is no forced reload or `skipWaiting` message, so resource updates
do not interrupt a sitting. Service-worker caches never store or clear learner IndexedDB
data. The existing learner model supports one writing window at a time; reopening an
active sitting treats it as unfinished under the documented storage policy.

Questions use stable five-character lowercase alphanumeric IDs in URLs and saved history.
The bank's `order` field controls display numbering and study order; question IDs do not
include a section prefix.

Learner snapshots and exported backups use version 3 with these question IDs and an
explicit finish reason for completed tests. This MVP does not migrate older local data or
backups; use a fresh learner profile for this version. Unsupported data is preserved and
rejected.

If startup shows “Saved data cannot be loaded”, use **Download saved data** to keep the
original snapshot, then **Start with a fresh profile** and confirm the reset. Nothing is
replaced before confirmation. The download preserves the original data for recovery;
unsupported or damaged snapshots cannot be imported into this version. If another app
window changes the saved data before confirmation, the reset is blocked: reload to inspect
the current state before trying again.

On iPhone/iPad, follow Settings → install guide. The Home Screen app has separate storage:
export from Safari, import and confirm in the installed app, and prepare that copy online
until it reports readiness. Browser storage can be evicted, so keep a downloaded backup.
Native Safari/Home Screen installation should still be smoke-tested on real iOS devices;
Chromium viewport/standalone simulations cannot verify OS installation behavior.

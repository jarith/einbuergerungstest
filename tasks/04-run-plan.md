# Task 04 — Router and shell execution plan

## Scope and decisions

- Implement locally without commits or new tests. Preserve pre-existing task edits.
- Follow the requirements, acceptance features, ADR 0003, and desktop/tablet/phone shell
  in `einbuergerungstest.pen`. Page bodies remain name-only placeholders.
- Use installed Reatom 1001.3.0 native layout, loader, render, outlet, path and go APIs.
  Keep page route factories in `<page>.route.ts`, exported through page `index.ts`.
- The layout loader owns bank loading, learner readiness and localization. Child loaders
  await that shared loader and pass resolved data to their page component. Keep learner
  models live, rather than copying snapshot data into route results.
- Canonical study URLs are `/study/:questionKey` and
  `/study/groups/:groupId/:questionKey`. Entry URLs select the saved or first question and
  replace the current entry. Explicit question navigation does not write saved study
  positions. Completion behavior remains task 08/11 work.
- Canonical live mock URLs are `/mock-test/:testId/:questionKey`. `/mock-test` is the
  start state, or redirects to the current active sitting. Validate paper membership. The
  URL selects the displayed question; persisted currentQuestion only initializes an entry
  URL. Reloaded mocks remain unfinished under the existing storage policy.
- Resolve image URLs and responsive metadata with the question in the loader. Keep native
  browser image loading: do not prefetch every image or build question UI here.
- Unknown URLs, groups, questions, paper questions and sitting IDs show not-found. Mock
  creation, timing, answer controls and grading remain task 13/14 work.
- Confirm departure from an active sitting, including links and browser history; persist
  unfinished status before completing navigation. Keep the sitting open on cancellation or
  write failure.

## Checklist

- [x] Inspect documentation, specs, existing code and Reatom v1001 API/source.
- [x] Implement shared loading and all page loader/render pairs.
- [x] Implement canonical question routes and validation.
- [x] Implement responsive shell and departure handling.
- [x] Manually verify routing, direct links, history, errors/retry and responsive layout.
- [x] Run yarn lint, yarn ts:compile and yarn test; record results and limitations.

## Verification results

- `yarn lint` passed. ast-grep reports its existing runtime-binary fallback notice;
  there are no lint errors.
- `yarn ts:compile` passed across the workspaces.
- `yarn test` passed: 25 existing test files, 447 tests. No tests were added or changed.
- `yarn workspace @einbuergerungstest/web build` passed.
- Disposable Chromium sessions exercised all ten placeholder pages, study/group entry
  redirects, explicit question URLs, history navigation, invalid URLs/group/question/test
  IDs, and question membership validation. Question 21 supplies all responsive image URLs.
- A failed bank request displayed recovery UI. Retrying recovered both layout and page
  loaders. Bank requests remained at one during ordinary navigation and language changes.
- Saved study position initialized the entry URL. Explicit question links and browser
  history selected their URL question without overwriting that saved position.
- An existing 33-question mock used the URL question even when persisted currentQuestion
  differed. Moving between paper questions did not prompt for departure. Shell navigation,
  links, and Back prompted; cancellation preserved the sitting and URL. A simulated save
  failure kept the dialog and active sitting. Confirmation saved unfinished state before
  navigating; Forward to the expired live URL showed not-found, and review was available.
- Inspected desktop 1440×900, tablet 820×1180 and phone 390×844. Navigation changes from
  sidebar to top tabs to bottom tabs, with no horizontal overflow. German not-found and
  navigation text were checked. Browser checks ended without page or console errors.
- `git diff --check` passed. No commits were made.

## API findings and later work

The v1001 route render helper subscribes to the loader itself before reading status/data.
This keeps the active page connected so a parent loader retry refreshes it. Entry loaders
read exact-match state synchronously before awaiting resources: a prefix match must not
prevent a later entry navigation from resolving the saved position.

The browser adapter coordinates History API restoration and `urlAtom`, since the installed
router has no departure-blocker API. A cancelled Back/Forward returns to the original
history entry; confirmed departure writes unfinished state before replaying the traversal.
Reload/tab-close uses the browser's native confirmation and the existing launch policy.

Page bodies deliberately remain name-only mocks. Question presentation, native `<img>`
rendering, study-position updates, mock creation/timing/grading, progress projections, and
PWA offline readiness remain their later tasks. The complete product acceptance suite is
not a completion gate for these placeholders; no acceptance tests were edited or added.

## Sidebar design follow-up

- [x] Match the supplied desktop sidebar: 236px width, surface background, right border,
  brand/region typography, 30px/18px padding, icon navigation, and bottom footer.
- [x] Keep all five primary destinations and existing route/guard behavior; retain access
  to secondary placeholder pages without the temporary global link row in the main body.
- [x] Verify desktop appearance and responsive navigation; rerun lint, types and existing
  tests. Do not add tests or commit. Until PWA caching exists, use truthful device-local
  storage copy in the footer rather than claiming offline readiness.


Sidebar verification: lint, TypeScript, existing tests and formatting all passed. Browser
checks confirmed all five primary destinations and active states, keyboard focus, five
navigation icons, and no horizontal overflow at 1440×900, 820×1180 and 390×844. Also
inspected German labels in dark appearance. No browser page errors, new tests or commits.
The sidebar now imports the installed `lucide-react` components. Settings uses a gear;
the device-local storage footer uses Database. No copied icon geometry remains.

## Design and frontend review follow-up

- [x] Extract shell regions and exit confirmation with colocated styles and focused inputs.
- [x] Replace copied SVG paths with the installed Lucide React components.
- [x] Separate route registration from layout presentation and render loader states through
  a subscribed React component; preserve page-owned factories, URL contracts and guards.
- [x] Verify lint, types, existing tests, production build and browser behavior; record
  review findings in the chat.


Review results: shell regions and their styles are colocated beneath AppShell; only the
exit dialog reads pending navigation state. AppLayout owns the route-to-shell presentation,
while app.route.tsx registers the layout and page factories. Page route callbacks render
RoutePage in JSX, with loader subscriptions owned by that component. Route files retain the
ADR 0003 convention and use .tsx where they contain JSX.

Validation passed: yarn lint, yarn ts:compile, yarn test (447 lint-rule unit tests plus 20
ast-grep rule suites; the web workspace has no unit test files), and the web production
build. Disposable Chromium checks covered primary navigation/current states, study and
group redirects, history, installation, invalid routes/IDs, startup failure/retry on a deep
link, language/theme updates, skip-link focus, and mock exit cancellation/confirmation plus
unfinished review. Screenshots were inspected at desktop, tablet and phone sizes, including
German dark appearance. No overflow at 1440, 820, 390 or 320 CSS pixels and no page errors.
No tests were added or changed.

Review finding: app/navigation.model.ts used a pathname prefix for staysInPaper.
Navigating an active sitting to /mock-test/<active-id>/invalid-question bypassed exit
confirmation, rendered not-found and left the sitting active. Reproduced in Chromium.

## Departure guard review fix

- [x] Replace the prefix check with exact paths built from the active paper's question keys.
- [x] Verify valid question/entry navigation, invalid destinations, cancellation, browser
  history, and persistence before confirmed departure; run lint and TypeScript checks.

Resolved with exact question paths generated by the existing mock route for each answer
in the active paper. Both mock entry paths retain their existing behavior. Disposable
Chromium checks passed for valid paper questions and query/hash changes; invalid question
keys, out-of-paper questions, extra segments, and other sittings now prompt for departure.
Cancellation (including Back) preserves the URL and active sitting. A simulated storage
failure keeps the dialog open; retry saves unfinished state in IndexedDB and navigates to
the requested not-found page. No page errors. Web lint, TypeScript, formatting and
git diff --check passed. No tests were added or changed.

## Design and frontend review corrections

- [x] Use native destination links while preserving departure guards and disabled states.
- [x] Give each route a localized page heading and document title.
- [x] Add long-wait startup recovery, a bounded bank request, and accessible save feedback.
- [x] Give exit confirmation one primary action and preserve safe write behavior.
- [x] Use available Panda JSX patterns throughout the changed shell and check adjacent
  layout authoring for bypasses; preserve semantic elements and CSS extraction.
- [x] Keep navigation labels readable at phone widths and enlarged text sizes.
- [x] Verify types, lint, existing tests, production CSS, routing, guards, recovery,
  keyboard behavior, and responsive layouts; record results below.


Verification: `yarn lint`, `yarn ts:compile`, `yarn test` (447 existing lint-rule
unit tests and 20 ast-grep suites), the web production build, and all 14 existing
Storybook browser tests passed. Targeted formatting checks and `git diff --check`
passed. No tests were added or changed.

Disposable Chromium checks verified real navigation links, opening a destination in a
new tab, disabled/current link semantics, keyboard activation, skip-link focus, entry
redirects, Back, localized route headings/document titles, invalid-resource titles,
mock departure cancellation, and persistence before confirmed departure. A held bank
request showed recovery at 15 seconds, failed at 30 seconds, and recovered its deep
route on retry. A real IndexedDB transaction held open past its deadline was aborted;
the mock stayed active, and a subsequent retry saved unfinished status and navigated.
Pending and long-wait save messages were visible. There were no page errors.

Rendered desktop, tablet, and phone layouts (1440, 820, 390, and 320 CSS pixels) were
checked, including German dark appearance and 200% text at 320 pixels. Navigation
reflows into additional rows without splitting labels. It stays in document flow so
an enlarged navigation region does not cover the page. Long page headings can hyphenate
or wrap. Production CSS was checked separately, including generated token-grid and
Toolbar examples. The sampled shell accessibility scan had no violations; this is not
a full screen-reader audit.

Panda audit: application layout, main content, headers, footer, navigation, dialog
controls, the choice-group stack, and layout/component/token examples use public JSX
patterns (or package-internal generated primitives inside the design system). No
pattern-function layout wrappers remain in authored `.styles.ts` files. The shell
sidebar retains local CSS for its intentional `display: contents` to desktop flex
transition. Component recipes and semantic controls remain the shared visual authority.

Implementation notes: storage deadlines abort the transaction and await its abort event;
they do not reject a promise while allowing a write to commit later. Database opens that
succeed after abandonment close their connection. Reatom cancellation reaches the native
bank fetch through `abortVar.subscribe()`. Panda's `Grid.minChildWidth` accepts CSS units
such as `10rem` directly; bracketed escapes there produce invalid generated CSS. Builds
retain non-blocking chunk-size and generated `use client` directive warnings.

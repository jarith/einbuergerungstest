# 04 — Router and application shell

## Goal

Establish reatomRoute as the app router and the contract that every final page route owns
a loader for its data and a render function for its page component.

## Work

- In app, define the layout route with bootstrap loader and AppShell render. Establish the
  composition pattern for page-owned route factories beneath it; keep definitions in each
  &lt;page&gt;.route.ts and the page component behind that page's index.ts. Register each
  route when its page task is implemented, using the list in the [master plan](README.md).
- Await shared bank, IndexedDB, and localization readiness in loaders. Each leaf loader
  resolves its validated parameters and page-specific bank or learner data. Its render
  reads loader status and shows loading, recoverable error/retry, or the page component.
  Keep live progress in shared Reatom selectors rather than copied loader snapshots.
- Use route path builders/go methods for links and actions, support direct links and
  browser back/forward, and show not-found states for unknown URLs, group IDs, question
  keys, and test IDs. Add the mock departure guard so back, shell navigation, and in-page
  links all reach the exit confirmation.
- Implement the responsive shell from the design: desktop navigation, touch navigation at
  iPad/iPhone widths, safe-area padding, page landmarks, and text/icon status cues.

## Complete when

The layout, route-registration pattern, navigation, and shared loader/error handling work
for available pages. Each subsequent page task completes its own loader/render pair; the
final route inventory is checked at integration. The installed API supports layout,
outlet, loader, and render; see the
[Reatom handbook](https://v1001.reatom.dev/handbook/routing/) and
[reference](https://v1001.reatom.dev/reference/routing).

# 04 — Router and application shell

## Goal

Establish reatomRoute as the app router and the contract that every final page route owns
a loader for its data and a render function for its page component.

## Work

- In app, define the layout route with bootstrap loader and AppShell render. Establish the
  composition pattern for page-owned route factories beneath it; keep definitions in each
  &lt;page&gt;.route.ts and the page component behind that page's index.ts. Register all
  routes with name-only mock page roots, using the list in the [master plan](README.md).
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

## Refined implementation scope

See [the execution plan](04-run-plan.md) for decisions and verification. This task now
registers every page with a name-only mock root component; later page tasks replace the
placeholder body while retaining its loader/render contract. No tests are added.

The current question is a path parameter and the sole display-position source:

| Flow               | Entry URL                            | Question URL                          |
| ------------------ | ------------------------------------ | ------------------------------------- |
| All-question study | `/study`                             | `/study/:questionKey`                 |
| Group study        | `/study/groups/:groupId`             | `/study/groups/:groupId/:questionKey` |
| Live mock          | `/mock-test` or `/mock-test/:testId` | `/mock-test/:testId/:questionKey`     |

Entry loaders replace the URL using the saved or first position. Explicit question URLs do
not overwrite saved sequential study positions. Question loaders validate group or
mock-paper membership and provide the selected question and resolved image metadata. The
bank is shared through the layout loader; image bytes remain native browser loads when the
later question components render them. Live learner models remain in the loader payload,
rather than snapshots of progress.

The mock start page does not generate a sitting in this task. Existing active sittings can
be routed and guarded; task 13/14 still owns generation, timer, answering and grading.
Leaving requires confirmation and a successful unfinished-state write before navigation.
Reload preserves the existing rule that an active sitting becomes unfinished.

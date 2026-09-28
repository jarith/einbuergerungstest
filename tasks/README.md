# Berlin Einbürgerungstest implementation plan

This is the master plan for the full application. Follow the numbered tasks in order; the
dependency column identifies work that must exist before a task can be completed. The plan
deliberately contains no unit-test implementation.

## Source of truth and starting point

- [Requirements](../docs/requirements.md), [domain glossary](../docs/CONTEXT.md),
  [device-local progress decision](../docs/adr/0001-device-local-progress.md),
  [offline bank and localization proposal](../docs/adr/0002-offline-question-bank-and-localization.md),
  and [accepted project structure](../docs/adr/0003-web-project-structure.md).
- [Acceptance scenarios](../e2e/features/) define observable behavior. The
  [design file](../einbuergerungstest.pen) shows desktop, iPad, and iPhone states for the
  dashboard, study, mock test, result, progress, settings, and installation flows.
- The application currently has a minimal [entry point](../web/src/main.tsx), reserved
  folders under web/src, a reusable
  [design system](../packages/design-system/src/index.ts), and a static
  [Berlin question bank](../web/public/questionbank-berlin.json). There is no application
  router or learner persistence yet.
- The bank has 310 questions, 13 groups with English and German metadata, and 13
  illustrated questions referencing 35 unique image files. The authored bank and images
  stay in web/public. Task 01 covers their runtime contract.

## Architecture and data flow

Treat Berlin test preparation as one bounded context. Reuse business behavior through
domain modules; a page is a presentation boundary, not a separate bounded context. Keep
the accepted web/src structure:

| Owner                  | Responsibility                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| app                    | Route composition, responsive shell, UI localization, and offline lifecycle.                                                         |
| modules/question-bank  | Bank schema, stable question keys, group indexes, resource loading, and shared German/English question and image presentation.       |
| modules/learner-state  | Attempts, study positions, settings, backup/import/reset, IndexedDB repository, and derived progress.                                |
| modules/mock-test      | Paper generation, active sitting lifecycle, timer, final grading, and history rules.                                                 |
| pages                  | One folder for each of the ten pages in ADR 0003; each owns its route, page component, page-local model, and page-specific children. |
| shared/navigation      | Small domain-independent navigation helpers only.                                                                                    |
| packages/design-system | Existing visual primitives and tokens, extended only when a genuinely reusable primitive is missing.                                 |

Pure rules in module domain folders must not depend on React, Reatom, IndexedDB, or
i18next. Reatom application models expose named atoms, derived values, and actions.
Infrastructure handles browser storage and static assets. A route loader awaits the shared
bootstrap and resolves its route-specific data; it must not freeze live progress into a
stale one-time copy. Page components subscribe to the shared Reatom projections. Pages
never import another page.

Use a stable question key made from section and source_question_id. Persist the source
facts: settings, study positions, study attempts, and mock sittings. Derive a single
question-attempt timeline from study attempts and selected answers in completed mocks,
then derive current question status, solved counts, percentages, and mock summaries. A blank
answer in a completed mock and every selection in an unfinished mock create no question
attempt.

## Router contract

Use the installed @reatom/core 1001.3.0 reatomRoute API. The
[Reatom routing handbook](https://v1001.reatom.dev/handbook/routing/) and
[routing reference](https://v1001.reatom.dev/reference/routing) describe nested routes,
loader state, render, outlet, typed navigation, and cancellation. The app composition root
registers page route factories under a layout route. Its loader awaits bank,
learner-state, and localization bootstrap; its render wraps the active outlet in AppShell.
Every page route has an async loader for relevant data and a render function that handles
loading/error/retry and renders its page component. Page route files retain the ADR's
&lt;page&gt;.route.ts convention; the app composes their public interfaces without
page-to-page imports.

| URL                              | Page             | Loader resolves                                                                              |
| -------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| /                                | dashboard        | Groups, bank size, progress model, planned date, offline state.                              |
| /study                           | study            | Ordered bank, saved all-question position, optional validated question key, attempt history. |
| /study/groups                    | study-groups     | Localized group metadata, counts, saved positions, group progress.                           |
| /study/groups/:groupId           | study            | Validated group, its ordered questions and position, optional question key, attempt history. |
| /mock-test                       | mock-test        | Current in-memory sitting or start state, paper questions, deadline.                         |
| /progress                        | progress         | Status projections, recent questions, mock history, backup actions.                          |
| /progress/questions              | question-list    | Bank index, status filter, attempts summary.                                                 |
| /progress/questions/:questionKey | question-history | Validated question, complete chronological attempts.                                         |
| /progress/tests/:testId          | test-review      | Completed or unfinished sitting, paper order, selections, and result when completed.         |
| /settings                        | settings         | Current settings, backup summary, import/reset actions.                                      |
| /settings/installation           | installation     | Offline readiness and installation guidance.                                                 |

Question selection is a path parameter: `/study/:questionKey`,
`/study/groups/:groupId/:questionKey`, and `/mock-test/:testId/:questionKey`. The shorter
entry URLs in the table redirect with history replacement to the saved or first question;
`/mock-test` shows its start state when no sitting is active. The URL is the source of
truth for the displayed question. Explicit study links do not overwrite saved sequential
positions. Loaders validate bank, group, and paper membership and resolve question image
metadata. See [task 04's execution plan](04-run-plan.md).

Use route path builders and go methods for navigation, support browser back/forward and
direct links, and show a useful not-found state for invalid keys or unknown URLs. The live
mock route intercepts attempted departure for exit confirmation and persists unfinished
status before leaving. Reloaded active mocks become unfinished under the storage policy.

## Ordered work

The task documents are implementation handoffs. A checkmark can be added to this table as
each outcome is verified.

| Order | Task                                                         | Depends on    | Outcome                                                                      |
| ----- | ------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| 01    | [Resources and question bank](01-resources.md)               | —             | Validated bank and native image loading.                                      |
| 02    | [Learner state and IndexedDB](02-learner-state-indexeddb.md) | 01            | Durable Reatom-synchronized facts and safe backup operations.                |
| 03    | [Localization and preferences model](03-localization.md)     | 01–02         | English/German UI and independent study translation setting.                 |
| 04    | [Router and app shell](04-router-shell.md)                   | 01–03         | reatomRoute composition, page contracts, and responsive navigation.          |
| 05    | [Core question and answer rules](05-core-question-answer.md) | 01–02         | Shared rendering, answer semantics, images, and attempt recording.           |
| 06    | [Progress projections](06-progress-projections.md)           | 01–02, 05     | Latest-attempt statuses and aggregate counts.                                |
| 07    | [Settings page](07-settings-page.md)                         | 02–04         | Preferences, planned date, backup, import, and reset UI.                     |
| 08    | [Ordered study flow](08-ordered-study.md)                    | 05–06         | Bank-order study with saved position and immediate feedback.                 |
| 09    | [Study page](09-study-page.md)                               | 04–05, 08     | All-question presentation with a group-capable page structure.               |
| 10    | [Dashboard page](10-dashboard-page.md)                       | 04, 06–08     | Entry actions, countdown, overall and group progress.                        |
| 11    | [Group study flow](11-group-study.md)                        | 01–02, 08–09  | Scoped bank-order passes, group route, and per-group positions.              |
| 12    | [Study groups page](12-study-groups-page.md)                 | 03–04, 06, 11 | Localized picker for all 13 groups.                                          |
| 13    | [Mock test domain](13-mock-test-domain.md)                   | 01–02, 05–06  | Paper, timer, lifecycle, and grading.                                        |
| 14    | [Mock test page](14-mock-test-page.md)                       | 04–05, 13     | Timed sitting and submission/exit controls.                                  |
| 15    | [Test review page](15-test-review-page.md)                   | 03–05, 13     | Completed and unfinished review states.                                      |
| 16    | [Question list page](16-question-list-page.md)               | 04, 06        | Browse/filter all 310 questions.                                             |
| 17    | [Question history page](17-question-history-page.md)         | 04–06, 08     | Latest and earlier attempts, study entry.                                    |
| 18    | [Progress page](18-progress-page.md)                         | 06, 13, 15–17 | Question and mock history overview with backup access.                       |
| 19    | [Installation page](19-installation-page.md)                 | 03–04         | iPhone/iPad steps and progress transfer guidance.                            |
| 20    | [PWA and release integration](20-pwa.md)                     | 01–19         | Standalone launch, complete offline cache, safe updates, final verification. |

The sequence puts content and durable facts before UI routes, then delivers study, group
study, and mock test as vertical slices. Progress views follow the behavior that feeds
them. The PWA task is last so its offline manifest can enumerate final app assets and all
question images. Route and page work may be performed together within a slice as long as
the stated dependencies hold.

## Completion checks

- Run type checking, lint, formatting check, and production build for changed code. Verify
  the relevant existing acceptance scenarios and inspect the finished screens at desktop,
  820×1180, and 390×844. Do not add unit tests.
- Confirm 310 questions and every illustration work offline; English and German UI keep
  German exam content intact; the study translation preference survives reload.
- Confirm latest-attempt progress, per-group counts, saved study positions, 30+3 mock
  sampling, 60-minute deadline, 17/33 pass rule, unfinished history, and blank-answer
  semantics.
- Confirm import preview and explicit replacement, invalid-backup preservation, complete
  export, reset confirmation, and separate Safari/Home Screen storage guidance.
- Retire the obsolete starter-only acceptance scenario during integration. The template
  still has a unit-test CI job; align the application delivery gate with the requested
  no-unit-tests scope without changing unrelated package behavior.

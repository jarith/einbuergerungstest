# Task 03 run plan — Localization and preferences

## Scope and decisions

Read requirements, glossary, ADRs, task handoffs, and localization acceptance scenarios.
Preserve existing uncommitted task 02 work. Implement locally without commits or tests.

- Initialize an isolated i18next instance after learner hydration, with bundled English
  and German catalogs and no browser detection or network loader.
- Derive preferences from committed learner state. Synchronize language and document
  metadata after preference changes, import, and reset; connect appearance to the existing
  DesignSystemProvider. Failed persistence must not change the displayed preferences.
- Provide typed UI messages, plural counts, locale-aware numbers and dates, and localized
  group metadata. Keep German exam text in the bank and expose presentation rules that add
  English only during study and completed review when enabled in English UI.
- Keep the saved translation choice independent from language. Live and unfinished mocks
  never offer translation. Settings controls, routes, and question components remain in
  their subsequent tasks; no temporary settings screen is needed for this foundation.
- Use the existing learner preference mutation API rather than adding another write path.

## Checklist

- [x] Inspect documentation, existing work, and applicable skills.
- [x] Add dependencies, bundled catalogs, and typed localization initialization.
- [x] Add preference projections and content presentation helpers.
- [x] Integrate bootstrap, React provider, appearance, and document language.
- [x] Run lint, TypeScript, existing tests, formatting, and production build.
- [x] Inspect browser behavior, review diff, and update progress without committing.

## Verification and handoff

- `yarn lint`, `yarn ts:compile`, and `yarn test` pass. Existing tests report 447 Vitest
  tests plus 20 tooling checks. No test files or test configuration were added or changed.
- `yarn format:check`, `yarn build`, and `git diff --check` pass. The build includes the
  app and Storybook; existing tooling emits non-fatal postinstall, deprecation, and
  Storybook chunk-size warnings.
- Direct Chromium inspection verified English defaults in a German browser, translation
  off initially, German/English switching, reload persistence, dark appearance, reset, and
  import restoring the saved language and document metadata.
- With the browser offline after bootstrap, both catalogs and all 13 localized groups
  remain available. All 310 question projections preserve German questions and choices,
  add English during enabled study, and omit English in live mocks. Completed review
  permits the toggle; German UI and unfinished review do not.
- Verified English/German zero, singular, plural, and thousands formatting. A planned
  calendar date remains October 1 in an America/Los_Angeles browser rather than shifting
  to September 30.
- A competing learner instance caused a rejected stale write. Localization retained the
  last committed preferences and document language, without an optimistic theme change.
- The current root has no horizontal overflow at desktop, 820×1180, and 390×844 sizes.
  Full page-level acceptance and offline reload depend on the later page and PWA tasks.
- Dependencies follow the root-only manifest rule. The task document records the public
  model API and the required content context for future consumers. Existing task 02 work
  is preserved. No commit was created.

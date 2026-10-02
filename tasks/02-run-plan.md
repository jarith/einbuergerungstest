# Task 02 run plan — Learner state and IndexedDB

## Scope and decisions

Read requirements, domain glossary, ADRs 0001–0003, task dependencies, and the study,
group-study, dashboard, localization, mock-test, and progress acceptance scenarios.
Starting working tree is clean. Implement locally; do not commit or add/change tests.

- Keep one version-1 learner snapshot: English UI, translation off, light appearance,
  optional local calendar date, independent study positions, ordered study attempts, and
  active/completed/unfinished mocks. No question bank or derived totals in storage.
- The question bank and images are fixed. Store stable question keys directly, validate
  every history reference, and derive attempts without content revision filtering.
- IndexedDB v1 has one snapshot store and one record. Validate on reads and before writes.
  Unsupported versions fail without clearing data; future migrations belong at this
  boundary. Resolve writes on transaction completion, never on request success.
- Serialize read/modify/commit/publish operations and reject stale writes from another app
  instance by comparing the previously read snapshot. Reatom exposes only the committed
  snapshot. Errors and pending operations remain observable; no silent memory fallback.
- Bootstrap once per model/app launch, before learner-dependent content. Close saved
  active mocks as unfinished and clear only dates before today's local calendar date.
  Backgrounding does not bootstrap again. No routes or settings screens in this task.
- Preview validated imports without durable mutation. Confirmation commits exactly the
  previewed data, normalized as a fresh launch; cancellation leaves data alone. Reset also
  requires a separate request and confirmation. Export contains the whole snapshot.
- Expose storage-level mock draft/lifecycle actions; random paper generation, timers,
  grading, UI confirmation dialogs, and aggregate progress belong to later tasks.

## Checklist

- [x] Inspect documentation, specifications, existing code, and applicable skills.
- [x] Define snapshot contracts, launch normalization, and stable question references.
- [x] Implement validation and atomic IndexedDB repository.
- [x] Implement serialized Reatom actions, preview/confirmation, and shared bootstrap.
- [x] Run yarn lint, yarn ts:compile, yarn test; format changed files and build.
- [x] Review final diff, record verification, and update task progress without committing.

## Verification

- `yarn lint`, `yarn ts:compile`, and `yarn test` pass. The existing test job reports 447
  Vitest tests and 20 additional tooling checks; the web workspace has no unit tests.
- `yarn format:check` and `git diff --check` pass.
- `yarn build` passes, including the application and Storybook. Existing tooling emits
  postinstall/deprecation and Storybook chunk-size warnings; no build errors.
- Used a fresh headless Chromium context for direct runtime inspection; no test files or
  test configuration were added or changed. Verified 15 simultaneous answer writes,
  concurrent preference patches, reset cancellation and confirmation, import preview and
  replacement, invalid-backup preservation, and reload persistence.
- Verified a transaction abort leaves the Reatom snapshot unchanged and exposes a useful
  error, with subsequent writes succeeding. A stale app instance cannot overwrite a newer
  durable snapshot. Repeated bootstrap preserves an active mock; a fresh launch closes it
  as unfinished, keeps selections, and clears an expired local calendar date.
- Verified blank/draft answers yield no attempts, repeated mock finalization produces only
  one selected-answer attempt, and later study answers retain chronological order.
- Existing page-level acceptance scenarios still require the later router and page tasks.
  This task verifies their persistence prerequisites rather than claiming those screens
  have been implemented. No commits were created.

## Fixed-content simplification

Remove content hashing, stored bank revisions, revision-based history filtering, archived
record counts, and position resets on content changes. Keep learner schema versions and
stale-writer protection. Update the task plans, requirements, and ADR to state that the
question bank and images never change. Re-run lint, TypeScript, and existing tests without
adding tests or committing.

- [x] Remove content revision code and simplify reference validation and bootstrap.
- [x] Remove content-versioning requirements from project documentation.
- [x] Verify the simplified implementation and record check results.

After simplification, `yarn lint`, `yarn ts:compile`, `yarn test`, `yarn build`, and
`yarn format:check` all pass. No tests were added or changed, and no commit was created.

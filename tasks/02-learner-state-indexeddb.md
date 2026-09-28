# 02 — Learner state and IndexedDB

## Goal

Make device-local learning facts durable and synchronized with Reatom. Storage contains
learner data only; the question bank remains a static resource.

## Work

- In modules/learner-state/domain, define a versioned snapshot containing UI language,
  study translation, appearance, planned date, all-question and per-group positions,
  ordered study attempts, and mock sittings with their selections. Use stable question
  keys and explicit completed/unfinished states. Derive mock question attempts from
  selected answers of completed sittings rather than storing a second copy.
- In infrastructure, own the IndexedDB schema, upgrade/migration path, validation, atomic
  replacement, and error handling. Read once at startup before route loaders render
  learner-dependent content. Serialize writes so rapid answers cannot overwrite newer
  state.
- In application, expose one Reatom mirror of the durable snapshot and named actions. A
  successful mutation commits the corresponding snapshot and updates Reatom consistently;
  storage failures are visible and cannot silently claim persistence. Derived totals are
  never stored as duplicate facts.
- Export the full versioned snapshot. Parse and validate an import without mutation, show
  its summary, then atomically replace data only after explicit confirmation. Invalid
  files leave both IndexedDB and Reatom unchanged. Confirmed reset atomically returns to
  first-use defaults.
- At a fresh application launch, close a persisted active mock as unfinished; merely
  backgrounding the same running app keeps it active. Clear a planned test date only when
  opening after its local calendar date has passed.

## Complete when

Reload, rapid updates, import, reset, and storage-error states keep the UI model and
IndexedDB consistent. This task supplies every page and
[progress projections](06-progress-projections.md).

## Refined implementation plan

See [the execution plan and verification record](02-run-plan.md). Implement this task as
three layers, with one shared application bootstrap:

1. **Domain:** version-1 snapshot with readonly learner facts, explicit mock and study
   states, first-use defaults, local-date launch rules, and a question-attempt timeline.
   Attempt timestamps increase in commit order, including within the same clock tick.
2. **Infrastructure:** strict backup decoding, IndexedDB v1 with one atomic snapshot
   record, transaction-completion acknowledgements, and compare-before-write protection
   against a stale app window. Unsupported snapshot versions fail without replacing data;
   future versions need explicit migration here. No legacy schema exists to migrate today.
3. **Application:** one read-only Reatom snapshot plus named queued mutation actions,
   observable errors/pending state, complete export, immutable import preview, and
   separate request/cancel/confirm replacement operations. Publish only after durable
   commit; failed writes retain the previous snapshot and do not poison the operation
   queue.
4. **Bootstrap:** load the bank and learner state once before rendering, exposing the same
   promise/model to future route loaders. Backgrounding does not reinitialize it. Imported
   active mocks also become unfinished, because a transferred sitting cannot be resumed.

### Fixed question content

The question bank and images are fixed and will not change. Saved history references
stable question keys directly; no content revisions, history compatibility checks, or
content migrations are needed. Backup schema and IndexedDB versions describe the learner
storage format only.

### Integration contract

`appModel.bootstrap()` supplies the validated bank and the shared learner model. Later
route loaders await it. The learner model exposes preference/position updates, study
answer recording, mock creation/selection/navigation/finalization, backup export, import
preview, and reset/confirmation actions. Pages must await mutation promises before
claiming success and render the model's error and pending states. Import preview includes
study, completed/unfinished mock counts and preferences. Settings-page dialogs,
localization, aggregate progress, random mock sampling, timers, and grading remain in
their numbered follow-up tasks.

# 02 — Learner state and IndexedDB

## Goal

Make device-local learning facts durable and synchronized with Reatom. Storage contains
learner data only; the question bank remains a static resource.

## Work

- In modules/learner-state/domain, define a versioned snapshot containing UI language,
  study translation, appearance, planned date, all-question and per-group positions,
  ordered study attempts, mock sittings with their selections, and bank revisions. Use
  stable question keys and explicit completed/unfinished states. Derive mock question
  attempts from selected answers of completed sittings rather than storing a second copy.
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
- Compare saved bank revisions with loaded content before reusing history for progress.
  Preserve older records for export and require an explicit migration/compatibility rule
  instead of silently attaching them to changed questions.

## Complete when

Reload, rapid updates, import, reset, and storage-error states keep the UI model and
IndexedDB consistent. This task supplies every page and
[progress projections](06-progress-projections.md).

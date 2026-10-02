# Task 08 — Ordered study execution plan

1. Add an application study model that resolves bank display order and saved all-question
   position, bounds navigation, persists completion, records immediate answers, and reopens retries.
2. Add a page-local scope model that resolves loaded question presentation and translation,
   and keeps direct question inspection independent from the saved sequential position.
3. Audit navigation, completion, retries, persistence and model subscriptions in a browser;
   run lint, TypeScript and existing tests. No new tests; page presentation belongs to task 09.
4. Repeat the audit/check cycle, format once, and commit locally.

## Tracking

- [x] Inspect task, specifications and shared question/learner models.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles verified bounded navigation, saved selection, append-only retry history, translation,
direct inspection isolation, and completion. A browser model audit navigated every one of the 310
questions in display order. A fresh learner model restored completion and translation from IndexedDB.
Invalid direct keys were rejected. Lint, TypeScript and existing tests passed in both cycles.
Task 08 has no new visual surface; task 09 binds and visually audits this model. No tests added.

# Task 18 — Progress page execution plan

1. Derive recent, status-filtered question summaries and mock history from shared live
   projections; compose the existing backup model in the route loader.
2. Implement the design's totals, question list and mock-history columns, adapting its
   obsolete three statuses to the required four. Reuse semantic design-system controls
   and the shared backup UI; preserve access to all questions and all test records.
3. Audit live updates, status filters, completed/unfinished semantics, stable links,
   backup flows, both languages and desktop/820×1180/390×844 layouts. Run lint,
   TypeScript and the existing tests, fixing errors without adding tests.
4. Repeat the audit and checks, run format once, update tracking and commit locally.

## Tracking

- [x] Inspect requirements, design and shared models.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles inspected fresh and populated Progress, four-state filtering, recent-first
question summaries and completed/unfinished mock history. Importing a mixed backup
updated the visible totals immediately; blank completed answers and unfinished choices
left question status unchanged. Stable unfinished-review links, export, import preview
and replacement, invalid-backup preservation, reset cancellation and confirmed reset
worked through the browser. English and German rendered correctly; desktop, 820×1180
and 390×844 had no horizontal overflow. The German phone audit reported no axe violations.

The design's obsolete three-status summary is deliberately adapted to the requirements'
four statuses. Backup controls reuse Settings' shared component behind a disclosure.
Both check cycles passed lint, TypeScript, 443 existing tests and 20 ast-grep suites.
Production build passed with its existing bundle-size advisory. No tests were added.

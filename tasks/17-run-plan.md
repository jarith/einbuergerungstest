# Task 17 — Question history execution plan

1. Add a route-owned history model using validated question data and live attempt
   projections, with latest/earlier choices, correctness, dates, and study/mock sources.
2. Compose the question/image, current-status badge, latest attempt, earlier attempts,
   not-started state and explicit study/back links. Reuse shared image enlargement.
3. Audit mixed study/mock ordering, retries, exclusion of blanks/unfinished choices,
   study-position preservation, empty/invalid routes, language, images and responsive
   accessibility. Run lint, TypeScript and existing tests.
4. Repeat audit and checks, including final integration across tasks 13–17, format
   once, and commit. Add no tests. Update task tracking only after verification.

## Tracking

- [x] Inspect design, routes, projections and study inspection behavior.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles verified mixed study/completed-mock history in newest-first order, latest
choice/correct answer/date/source, all four current statuses, a study retry without
overwriting the saved sequential question, and exclusion of blank or unfinished mock
choices. English/light phone and German/dark desktop/tablet states were inspected;
320px at 200% text did not overflow. Image enlargement and invalid-question recovery
worked, and axe reported no violations in the inspected history states.

Final cross-task audit found and fixed an exit dialog surviving timeout: completion now
clears the pending departure before opening review. Rechecked zero dialogs on automatic
completion and confirmed early exit saving one selection as unfinished. Both cycles
passed lint, TypeScript, 443 tests and 20 ast-grep suites. Production and Storybook builds
also passed. No new tests were added, and unwired BDD files were unchanged.

Updated progress.json through task 17, including the previously completed tasks 11–12
whose execution plans already recorded completion. Task 18 is next.

# Task 11 — Group study execution plan

1. Extend ordered study with a validated group scope, bank-order filtering, and independent
   saved positions while retaining the shared answering, retry, and progress behavior.
2. Wire group entry/question routes to the existing Study page, with localized scope,
   group completion totals, and navigation back to the picker.
3. Audit Constitution 1 → 3, Berlin 301 → 310/completion, separate saved positions,
   shared history, translations, invalid routes, and responsive design. Run lint,
   TypeScript, and existing tests; fix issues without adding tests.
4. Repeat the audit and checks, run formatting once, and commit locally without pushing.

## Tracking

- [x] Inspect documentation, acceptance scenarios, existing models, and design.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both audit cycles covered group ordering, independent saved positions, shared answer
feedback/history and progress, completion/restart, and reloads. Constitution advances from
source 1 to 3; Berlin traverses 301–310 and persists completion without showing another
question. A second correct answer counts once; a wrong answer in inspection removes the
same question from group progress. Entry records a starting position for picker resume.
Invalid groups and cross-group question links show not-found; failed bank loading recovers
through Try again. English translation survives reload; German UI hides the toggle.
Desktop/light, tablet/German dark, phone question/completion, and 320px at 200% text were
inspected against the design. Fixed long German labels overflowing at text zoom. Axe
reported no violations in inspected question/completion states; keyboard restart works.
The existing responsive shell and question components are reused. Current contributing
question terminology supersedes the design's older “solved” terminology.
Lint, TypeScript, 443 existing tests and 20 ast-grep suites passed in both cycles.
No new tests were added; the unwired BDD suite was left unchanged.

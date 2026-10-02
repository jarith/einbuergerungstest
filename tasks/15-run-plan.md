# Task 15 — Test review execution plan

1. Add a route-owned review model resolving persisted paper order, summary, choices,
   finish reason, current review position, and English-only translation preference.
2. Compose completed/unfinished summary, question review, previous/next, all-question
   picker and navigation, matching desktop sidebar and mobile summary placement.
3. Audit score/threshold, blanks/correct answers, unfinished grading suppression,
   reopen stability, translation, images, invalid routes and responsive accessibility;
   run lint, TypeScript and existing tests.
4. Repeat audit and checks, format once, and commit. Add no tests.

## Tracking

- [x] Inspect design and question presentation.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Verified 17/33 passed and blank 0/33 failed results, submitted/timeout reasons, correct
answer disclosure for blanks, all 33 review positions, choice preservation, English
translation persistence and German suppression, unfinished no-score/ungraded states,
reopening stability and invalid-ID recovery. Compared desktop, tablet dark/German, and
phone completed/unfinished layouts with the design. Axe found no violations in inspected
completed states; phones had no horizontal overflow. Removed the redundant shell link
above review and fixed two formatter-exposed spacing issues from task 14. Both cycles
passed lint, TypeScript, 443 tests and 20 ast-grep suites. No tests added.

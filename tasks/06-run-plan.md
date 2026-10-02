# Task 06 — Progress projections execution plan

## Scope and decisions

Build on the existing durable study/mock chronology and task 05 correctness rules. Keep
all derived progress out of storage. Existing page placeholders remain for their assigned
page tasks; their shared learner model gains live named projections.

1. Derive per-question chronological graded history, consecutive-correct streaks and the
   four learning statuses in learner-state/domain. Completed mock selections share the
   study streak; completed blanks and active/unfinished selections never enter history.
2. Derive overall and actual-size group totals, Learning + Learned contribution counts,
   rounded percentages, attempt totals, and scored/completed/unfinished mock summaries.
3. Attach named Reatom projections to the learner model so saves, imports and resets
   invalidate every dependent view. Add localized four-state status presentation using
   shared badge tokens and icons, following the requirements where the older design uses
   the previous three-state labels.
4. Update terminology in existing acceptance scenarios and step definitions. Do not add
   test scenarios or test files; exercise extra transition cases manually instead.
5. Audit domain behavior, reactive updates, presentation and project requirements; run
   `yarn lint`, `yarn ts:compile`, and `yarn test`, fixing issues. Repeat the complete
   audit/check cycle, then run `yarn format` once and commit locally without pushing.

## Tracking

- [x] Read task, requirements, glossary, existing chronology and acceptance specifications.
- [x] Implement projections and status presentation.
- [x] Update existing acceptance terminology without adding tests.
- [x] Complete first audit and validation cycle.
- [x] Complete second audit and validation cycle.
- [x] Format once and commit locally.

## Audit results

Both audit cycles passed. Manual browser/domain inspection covered every row of the
transition table, correct → wrong → correct → correct, repeated correct answers after
Learned, and two new correct answers after a Learned question was answered wrongly.
Chronological history remained intact, including deliberately unordered input, and the
pure projections did not mutate source facts. Stable general/Berlin question keys remain
separate. All 13 group denominators sum to 310; the Constitution group contains 27.

Verified 1/310 → 0%, 2/310 → 1%, and 1/27 → 4%. Learning and Learned each contribute
one question. Study/group answers share their streak. Completed mock selections extend or
reset that same streak; completed blanks and active/unfinished selections preserve it.
A subscribed preview immediately showed reduced group/overall counts after a wrong answer
without navigation. Reload, import and reset reproduced the appropriate projections.

Mock summaries distinguish 16/33 failed from 17/33 passed, count blank answers as zero,
and keep active/unfinished summaries unscored. Relaunch changed the active sitting to
unfinished without changing question progress. Completed/passed/failed/unfinished totals
and attempt counts matched the source facts.

Status presentation uses gray/red/orange/green with localized labels and Lucide icons.
Inspected light desktop and German dark phone previews, with reflow through 320px and
200% text. The initial orange/muted combination failed contrast (3.97:1); changing the
Learning badge to the existing surface background passed (4.58:1). Neutral badges use the
gray token. Both final theme samples passed the accessibility scan. The `.pen` progress
frames still use old three-state labels; the current four-state requirements take priority
while the established badge geometry and palette remain in use.

`yarn lint`, `yarn ts:compile`, and `yarn test` passed in both cycles after fixes (443
existing unit tests and 20 ast-grep suites). Production build and existing BDD generation
passed. No scenarios or test files were added; existing acceptance wording/steps were
updated, and additional transitions were inspected manually. Full product BDD remains
unwired as expected. Disposable previews were removed. `yarn format` was run once after
the audits, followed by a lint/format check because task 05 exposed formatter/linter line
placement interactions. No push was performed.

## Integration notes

Pages receive the same live learner model from existing loaders. Subscribe with
`reatomComponent` to `learner.progress.questions`, `.totals`, `.groups`, `.attempts`,
`.mocks`, or `.mockTotals`. The aggregate `learner.progress()` is available when all
projections are needed. Read projections after learner bootstrap, like other learner
operations. Never persist totals or copy them into route-loader output.

Question histories are oldest first and include correctness, source and timestamp;
`lastAttempt` and `attemptCount` are supplied per key. Mock summaries are oldest first
and expose `score: null`/`result: null` until completed. The status badge is shared by the
later study/progress pages. Those full page layouts remain their numbered tasks.

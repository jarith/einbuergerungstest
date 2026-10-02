# Task 13 — Mock domain execution plan

1. Add pure uniform sampling, absolute-deadline timing, and terminal transition rules.
2. Apply deadline checks inside queued persistence mutations and expose a shared Reatom
   sitting model with start, selection, navigation, submission, expiry, and leave actions.
   Reuse existing grading/progress projections and the existing backup contract.
3. Audit sampling, revisable drafts, deadline races, idempotence, blank semantics,
   unfinished launch/exit, and storage errors. Run lint, TypeScript and existing tests.
4. Repeat the audit and checks, format once, and commit locally. Add no tests.

## Tracking

- [x] Inspect requirements, persistence, projections, acceptance scenarios, and designs.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles passed lint, TypeScript, and the existing test suite (443 tests and 20
ast-grep suites). Browser inspection verified 1,000 valid distinct 30+3 papers covering
all 310 questions, revised selections, zero draft attempts, blank warnings, idempotent
completion, 16/33 failure and 17/33 pass, deadline rejection of late answers, and
unfinished reload with selections retained and zero attempts. Grading reuses the existing
projection. The domain task has no new visible screen; inspected the mock/review designs
for the subsequent page tasks. No tests were added.

# Task 01 run plan — Resources and question bank

Follow-up review superseded the custom loader and build validation script. The bank and
images remain static Vite public assets with runtime bank parsing.

## Selection and starting state

- Selected task: [Resources and question bank](01-resources.md), the first row in
  [Ordered work](README.md). It has no prerequisites. All later tasks remain unfinished
  because their prerequisite modules and pages are absent.
- Starting Git status: clean on `feat/mvp` (`git status --short --branch` returned only
  `## feat/mvp`). No pre-existing user changes need staging or exclusion.
- The authored `web/public/questionbank-berlin.json` has 310 questions (300 general,
  10 Berlin), 13 groups, 13 illustrated questions, and 35 distinct referenced WebP files.
  It has no revision. `web/src/main.tsx` still renders a starter label; the
  `question-bank` module directories contain placeholders only.

## Requirements and scope

- Keep the authored JSON and images at their existing public paths and retain the
  relative image URLs. The bank and images are fixed and require no content versioning.
- Define pure bank/group/question/option/image contracts and stable keys from `section`
  plus `source_question_id`. Validate section counts, 310 unique keys, four A–D options
  and one matching correct choice, German and English content, all 13 bilingual group
  records, group membership, display numbers, source IDs, image dimensions, and every
  referenced image variant. Display number is never the persistence key.
- Validate the authored file and referenced image files during production build. At
  runtime, load through one cached promise, validate the response, resolve image URLs
  relative to the bank asset URL, and index questions by stable key, group, and display
  order. Provide a loading/error/retry state. Bad or missing content must become a visible
  error before any later study or mock action can use the bank.
- Keep this task within `web/src/modules/question-bank`, the minimal app bootstrap
  needed to expose resource readiness, `web/public`, and build resource tooling under
  `web/scripts`. Do not add routes, learner persistence, study or mock behavior, a service
  worker, new tests, or changes to test commands.

## Contracts and references

- [Task 01](01-resources.md), [requirements](../docs/requirements.md),
  [glossary](../docs/CONTEXT.md), [ADR 0002](../docs/adr/0002-offline-question-bank-and-localization.md),
  and [ADR 0003](../docs/adr/0003-web-project-structure.md) govern this work.
  ADR 0001 supplies the later device-local history boundary; it does not add storage
  work to this task. ADR 0003 references `docs/open-decisions.md`, which is absent.
- Existing acceptance features for study, groups, mock tests, and PWA depend on this
  resource contract but require future tasks. The Task 01 acceptance check is a 310-item
  load with 35 resolvable image assets, stable lookup/group ordering, and visible failure
  on missing or malformed resources. Existing starter and future-flow scenarios cannot
  establish this task's behavior by themselves.
- This is a resource/domain task; no Pencil screen state applies. The temporary readiness
  view should remain minimal and accessible until the router and designed shell arrive.

## Ownership and ordered stages

1. [x] Orchestrator: audit tasks and code, record clean starting status, create
   `progress.json` with canonical names and direct dependencies, and write this plan.
2. [x] Implementation agent, sole application editor: read source and applicable
   `dev-best-practices` and TypeScript skills; implement the bank contract, build
   validation/resource list, loader/indexes, and minimal visible bootstrap state. Run
   `yarn format` exactly once at the end and inspect the diff. Do not touch tests,
   E2E steps, fixtures, snapshots, stories, test scripts, or `progress.json`.
3. [x] Repair agent, sole application editor after implementation: run `yarn lint`,
   `yarn ts:compile`, `yarn test`, and `yarn test:browser` in order, repair root causes,
   repeat until all pass, then format once and reconfirm. Also run build, formatting
   check, and direct Task 01 resource acceptance checks.
4. [x] Review agent, read only after repair: inspect the full diff against Task 01,
   project requirements, and ADR boundaries; report exact actionable findings or none.
   First review found truncated WebP build validation and conflicting shared-image
   metadata; both were resolved in the single rework pass.
5. [x] Same implementation agent: fix the two review findings without changing tests,
   then run `yarn format` once. Same repair agent repeats ordered checks and Task 01
   acceptance checks. Same reviewer checks the final diff once more. Final review found
   no remaining issues. The resource readiness view was inspected at 1440×900,
   820×1180, and 390×844 without horizontal overflow.
6. [x] Orchestrator: verify completion, update `progress.json`, inspect and stage only
   Task 01 work, and commit locally without pushing.

## Verification evidence to collect

- Ordered root checks: `yarn lint`, `yarn ts:compile`, `yarn test`,
  `yarn test:browser`; afterward `yarn build` and `yarn format:check`.
- Inspect the generated production bank and asset list. Check every listed image URL
  against the authored public files, including illustrated questions with fewer than
  three variants. Check successful runtime loading/indexing and visible retry after a
  missing or malformed bank or image response. Report any acceptance scenario blocked
  solely by later tasks rather than changing those scenarios.

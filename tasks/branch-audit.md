# Branch audit — 2026-10-02

Scope: `feat/questionaree` from its merge-base with `master`, including working-tree
changes. Implementation chat “Implement tasks 7–10” reported completion and was idle
before this audit began. Initial HEAD: `59edf2d`; initial working tree: clean.

## Plan

- [x] Verify implementation completion, branch scope, specifications, and prior notes.
- [x] Review all branch changes against task acceptance criteria and applicable guides.
- [x] Compare implemented screens and states with Pencil designs at desktop/tablet/phone
      sizes.
- [x] Reproduce and fix actionable issues without adding or removing tests.
- [x] Run `yarn lint`, `yarn ts:compile`, and `yarn test` and resolve errors.
- [x] Record findings, verification, limitations, and tests introduced by this branch.
- [x] Resolve the sequential-study URL contract with the user and verify the chosen
      behavior.

Future tasks 11–20 remain outside implementation scope; their placeholder routes are not
treated as regressions introduced by tasks 5–10.

## Fixed findings

1. **P2 — Clear date loses the first pointer click.** Blurring the focused date field
   started a save and disabled Clear before its click event. Clear now retains field focus
   until activation; date saving skips concurrent and unchanged writes. Both saved and
   edited dates clear with one click, including the persisted value.
2. **P2 — Stale settings and replacement writes recommend an ineffective retry.** A second
   app window can invalidate the current snapshot. Settings and backup controls now
   distinguish the existing storage-conflict error and display localized reload guidance
   while preserving the newer snapshot.
3. **P2 — Reset confirmation changes into import confirmation while saving.** The learner
   model consumes its confirmation before writing. The dialog now retains its operation
   kind in the UI model through the pending write. Verified with an actual IndexedDB
   transaction holding the write queue.
4. **P2 — Installation guidance links to a nonexistent route.** Settings now links to
   `/settings/installation`, matching the registered route.
5. **P2 — Restarting direct study leaves the last-question URL.** Restart now updates the
   direct-question URL alongside the displayed question; reload preserves question 1.
6. **P2 — German Settings text overflows at 320px/200% text.** Settings now permits long
   words to wrap/hyphenate throughout the page, including panel headings and links.
7. **P2 — Dialog headers become extra page banner landmarks.** The shared dialog's
   structural header now has presentation semantics; the dialog title remains a heading.
   Image zoom and backup dialogs retain focus trapping and Escape focus restoration.
8. **P2 — Visible hierarchy and alignment differ from the design.** Restored the dashboard
   headline sizes (47 desktop / 42 tablet / 30 phone), desktop intro geometry, study
   question sizes (30 / 29 / 22), study column gap/proportion, and the translation
   control's end alignment. The measured font values come from Pencil frames `j1jtc`,
   `RzNaT`, `A2xCb`, `zSjaA`, `HTJlD`, and `AVH7T`. Existing token and recipe ownership
   remains intact; the switch adds a named layout variant.
9. **P2 — Task ledger still schedules Settings after tasks 7–10 were implemented.**
   Recorded those implementations and advanced `nextTask` to Group study flow. The routing
   contract was resolved in the follow-up below.

## Routing decision — resolved

The user chose the documented per-question URL and browser-history contract on 2026-10-02.
The follow-up restores entry replacement and pushes Previous/Next/Restart navigation using
Reatom route APIs. Sequential URLs carry `mode=sequential`; unmarked question URLs retain
isolated inspection. The question path determines the displayed position, including after
Back/Forward. Loading or traversing history does not rewrite saved progress. Sequential
completion survives reload, and pending writes cannot navigate the learner back after
leaving the Study page. See the follow-up verification below.

## Verification

- `yarn lint`: passed, no errors. The existing ast-grep postinstall/runtime-binary
  fallback notice remains a tool warning.
- `yarn ts:compile`: passed, no errors.
- `yarn test`: passed, 443 Vitest tests across 24 files and 20 ast-grep suites.
- Application production build, changed-file formatting, and `git diff --check`: passed.
  Vite still reports its existing large-chunk warning.
- Disposable Chromium checks verified date save/clear/past-date rejection/countdown,
  wrong/correct/repeated-correct history, streak reset, decreasing progress, all 13 group
  summaries, translation persistence, reload, direct-question isolation, export, invalid
  import preservation, import/reset cancellation, confirmed import/reset, cross-window
  conflict guidance, installation navigation, and direct restart/reload.
- Independent domain checks verified the four-state transitions, two contributors = 1%,
  shared study/completed-mock streaks, and blank/unfinished mocks preserving history.
- Dashboard, Study, and Settings inspected at 1440×1000, 820×1180, and 390×844; German
  dark appearance also checked at 320px with 200% text. No page overflow or axe violations
  in these 12 combinations. Phone backup preview and image zoom also passed axe checks;
  Escape restores focus to the image trigger. No runtime page errors.
- Pencil screenshots and node measurements were compared with browser captures. Updated
  learning-status terminology and truthful device-storage copy intentionally take
  precedence over outdated solved/offline-ready labels in the design. Existing shell
  responsive behavior predates this branch; this is not a pixel-exact certification of
  every app screen. Real-device Safari and a manual screen-reader audit were not run.
- Evidence and disposable checks are under `/tmp/einbuergerungstest-branch-audit`. No new
  automated tests were added to the repository.

## Tests already on the branch

No new test files or test scenarios were added between merge-base `ce8fcb5` and `59edf2d`.
Five existing feature files and five existing step/helper files changed to the four-state
terminology and contributing-count rules; scenario count remains 39. These changes were
left intact. The full BDD suite still depends on future page tasks and is not claimed as
passing.

## Guide coverage

Reviewed dev-best-practices error handling, pure boundaries, module ownership, and content
sizing; frontend React authoring/decomposition/icons; TypeScript external validation,
unions and immutable contracts; Reatom model ownership, derivation, async boundaries and
forms; Panda authoring, tokens and responsive styles; accessibility and behavior-focused
testing. Consulted the official Panda v2
[recipe](https://panda-css.com/docs/recipes/overview) and
[token](https://panda-css.com/docs/theming/tokens) references for the small design-system
changes. No dependencies, commits, or pushes were made by this audit.

## Follow-up verification — current audit chat

The current audit starts with the prior fixes staged and preserves them. Plan:

- [x] Independently review the complete branch diff and staged corrections against the
      requirements and frontend/development guides.
- [x] Inspect current Pencil designs and verify the running application and existing
      disposable evidence.
- [x] Apply the user-approved routing contract and focused corrections for additional
      confirmed issues.
- [x] Re-run the requested checks and confirm the branch's test additions status.

### Approved routing correction

The user chose per-question URLs and browser history. Implementation plan:

1. Restore `/study` entry replacement to the saved/first question and push question
   changes into history using the route's typed navigation API.
2. Keep the path question as display authority. Carry `mode=sequential` in sequential
   URLs so reload and Back/Forward retain persistence behavior; unmarked direct links
   remain isolated inspection. Merely loading or traversing history never writes a
   saved position. Explicit sequential Previous/Next/Restart actions persist it.
3. Keep completion on the final sequential question, restore it on reload, and verify
   inspection, failures, retries, history, restart, and entry behavior in disposable
   browsers. Add no repository tests.


### Follow-up findings and verification

- Fixed the remaining routing regression using the approved plan above. Verified entry
  replacement, pushed question history, URL-selected display, reload, Previous/Next,
  final-question completion/reload/restart, invalid keys, direct inspection and retry
  isolation, stale-write errors, and navigation away or Back during a pending save.
- **P2 — Settings preference labels collapse to single-letter columns.** Visual inspection
  of the new phone capture revealed that inherited `overflow-wrap: anywhere` combined with
  Mantine's zero flex basis shrank each segmented control to its minimum character width.
  The shared recipe now sets `flex-basis: auto` alongside its existing `flex-grow: 0`.
  Labels retain intrinsic width and the existing wrapping behavior. Verified the rendered
  fix, including phone backup preview and the German 320px/200% text state.
- Independently reviewed branch changes from merge-base `ce8fcb5`, preserving all initial
  staged fixes. Rechecked pure progress transitions, shared mock/study history, blank and
  unfinished answers, rounding, all 13 groups, expired-date normalization, and calendar-day
  calculations with disposable checks.
- Fresh Pencil screenshots/node measurements were compared with current Dashboard, Study,
  and Settings captures. The existing shell's phone branding/navigation and shared control
  density still differ from the canvas; these predate this branch. No claim of pixel-exact
  parity or complete future-page implementation is made.
- Final `yarn lint`, `yarn ts:compile`, `yarn test`, production build, changed-source format
  checks, and `git diff --check` passed. Tests: 443 Vitest tests in 24 files and 20 ast-grep
  suites. Existing runtime-binary and build chunk-size warnings remain non-failing.
- The final browser run covered all nine desktop/tablet/phone page combinations plus three
  German dark 320px/200% text combinations: no horizontal overflow, axe violations, or
  runtime errors. Import/reset persistence, stable pending reset title, image zoom,
  Escape, and restored focus passed additional phone checks. A first dialog check was
  interrupted by source-formatting HMR; its clean rerun and final post-fix run passed.
- No test files or scenarios were added relative to the branch base; the scenario count
  remains 39. The existing five feature-file and five step/helper-file edits remain intact.
  Disposable verification scripts and captures stay outside the repository under
  `/tmp/einbuergerungstest-branch-audit`.
- No dependencies, commits, pushes, or automations were created. Pre-existing staging was
  preserved; the follow-up changes remain unstaged for review.

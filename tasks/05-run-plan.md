# Task 05 — Core question and answer execution plan

## Scope and decisions

Implement the shared question domain and presentation contract, preserving the existing
page placeholders for their later tasks. Reuse learner-state recording actions and the
existing localization policy. No new tests or acceptance-spec edits in this task.

1. Add pure option validation, correctness and mode-specific feedback rules.
2. Add controlled question content and answer feedback using design-system choices,
   notices, tokens and localized text. Study reveals immediate feedback, live mock stays
   revisable without grading, completed review reveals answers, unfinished review does not.
3. Add responsive illustrations and accessible full-image enlargement, zoom, keyboard
   scrolling, close/focus restoration, and image-load recovery.
4. Audit requirements/design and exercise components in a disposable browser preview.
   Run `yarn lint`, `yarn ts:compile`, and `yarn test`; fix findings without adding tests.
5. Repeat the audit and all three checks. Run `yarn format` once, update task tracking,
   and commit locally without pushing.

## Tracking

- [x] Read requirements, prior execution notes, architecture and design states.
- [x] Implement domain rules and shared presentation.
- [x] Complete first audit and validation cycle.
- [x] Complete second audit and validation cycle.
- [x] Format once and commit locally.

## Audit results

Both audit cycles passed. The shared component preserves German content and enforces
translation/feedback rules for study, live mocks, completed review and unfinished review.
Study retries appended separate timestamped attempts; live selections remained revisable.
Completed blanks reveal the correct answer for review without becoming study attempts.

Inspected desktop, tablet and phone renders against the study feedback and image/zoom
frames in the design. The shared 30px desktop question token, choice surfaces, German
labels, feedback icons and responsive images follow the design system. Checked light and
German dark appearances. All 13 illustrated questions loaded; the zoom dialog uses the
original resource, keyboard scrolling, focus trapping and Escape/focus restoration.
Simulated image failure recovered on retry. Sampled accessibility scans reported no
violations, and no browser errors occurred. The component reflows at 1440, 820, 390 and
320px, including 200% text (excluding the disposable preview's own heading).

Both cycles passed `yarn lint`, `yarn ts:compile`, and `yarn test` (443 existing unit tests
and 20 ast-grep suites). The production build passed with its existing chunk-size warning.
No tests were added or changed. Temporary preview files were removed. `yarn format` was
run once after the audits. No push was performed.

## Integration notes

`QuestionContent` is controlled: pass the selected option, mode, translation preference,
localized translator and bound callbacks. Its caller owns pending/error handling and
retry/reset state; recording stays in learner-state actions. Read-only choices retain
feedback contrast and localized text/icons. Page integration belongs to tasks 08–09,
14–17. This task verifies shared components, not those future complete screens.

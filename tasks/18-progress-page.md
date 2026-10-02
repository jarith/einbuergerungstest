# 18 — Progress page

## Goal

Give one overview of question status and completed/unfinished mock history, with access to
browsing and device-local backup controls.

## Work

- In pages/progress, add /progress with a loader for bank size, live status projections,
  recent question summaries, and mock history; its render mounts ProgressPage with
  loading/error handling.
- Show Not started/Needs review/Learning/Learned totals, status-filtered question summaries, a link to
  browse all 310 questions, and completed/passed/failed/unfinished mock totals. History
  entries open the appropriate completed or unfinished review by stable test ID.
- Provide export/import/reset access on this page as required by existing acceptance
  steps, using the shared learner-state backup actions and UI also used in Settings. Do
  not duplicate backup validation or mutation logic.

Use gray for Not started, red for Needs review, orange for Learning, and green for Learned,
with localized text or icons alongside color. Follow the
[learning-status requirements](../docs/requirements.md#question-learning-status).

## Complete when

The overview updates immediately after study or a completed mock, includes unfinished
sittings without scoring them, and its links reach every question and test record.

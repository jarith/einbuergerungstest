# 15 — Test review page

## Goal

Show the result and complete paper after a submitted/timed mock, and let the learner
inspect choices from an unfinished mock without a score.

## Work

- In pages/test-review, add /progress/tests/:testId with a loader for a validated stored
  sitting, its bank-revision-compatible questions, paper order, selections, and result if
  completed; its render mounts TestReviewPage with loading/error/not-found states.
- For completed sittings, show score, pass/fail, finish reason, unanswered count, each
  correct answer, and previous/next/all-questions review. English UI may toggle English
  text beside German; German UI has no toggle.
- For unfinished sittings, show saved selections and "no score" messaging without grading
  them or offering resume. Handle illustrations and image enlargement in both states.

## Complete when

A completed test can be reopened from Progress with identical result and answer review; an
unfinished test stays visibly distinct and ungraded.

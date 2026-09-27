# 13 — Mock test domain

## Goal

Model a complete practice sitting with the published Berlin test format and unambiguous
completed versus unfinished history.

## Work

- In modules/mock-test/domain, uniformly select 30 distinct general and 3 distinct Berlin
  questions for each paper. Persist their stable keys, order, bank revision, start time,
  and absolute 60-minute deadline.
- During a live sitting, keep selections revisable and ungraded. Persist selections as
  draft facts; they do not create question attempts. Derive the timer from the deadline so
  backgrounding does not pause it.
- Submission warns about blanks; confirmation or deadline expiry finalizes exactly once,
  gives blanks zero, passes at 17 or more correct of 33, and makes only selected answers
  eligible as derived question attempts. A confirmed early exit or fresh application
  launch makes the sitting unfinished, with its choices reviewable but no score or
  question attempts.
- Expose Reatom actions for start, select/change, navigate, submit, expire, and leave,
  backed by the learner-state repository. Keep grading and status transitions out of React
  components.

## Complete when

Repeated finalization cannot double-count attempts, timed and manual completion agree, and
completed/unfinished totals match the glossary and acceptance scenarios.

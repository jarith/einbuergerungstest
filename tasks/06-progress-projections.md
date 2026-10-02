# 06 — Progress projections

## Goal

Derive all visible progress from the learner's recorded facts, with one consistent
four-state learning rule across dashboard, study groups, and progress.

## Work

- In learner-state/domain, combine stored study attempts with selected answers from
  completed mocks into one durable chronology per stable question key. Derive Not started, Needs review,
  Learning, or Learned from consecutive correct answers, following the
  [requirements transition table](../docs/requirements.md#question-learning-status), while
  retaining earlier history. Blank
  answers and unfinished selections do not enter that timeline.
- Derive the count of Learning plus Learned questions and rounded whole-number percentage for all 310 questions and for
  each group's actual question count. Derive question totals, attempt counts, and
  completed/passed/failed/unfinished mock summaries.
- In learner-state/application, expose named Reatom computed projections. All pages
  consume these projections so a later wrong answer immediately lowers overall and group
  contributing counts without a route refresh.

## Complete when

Two contributing questions show 1% overall; one shows 0% overall; one in the 27-question
Constitution group shows 4%. Each Learning or Learned question counts once. Not started is
gray, Needs review red, Learning orange, and Learned green. Two consecutive correct answers
produce Learned; any wrong answer produces Needs review and resets the streak, including
from Learned. Two new correct answers are then required to regain Learned. Blank and
unfinished mock answers preserve the current state and streak. History is retained.

Update the existing acceptance scenarios and step definitions from the previous
correct/mistaken/untried status terminology and solved-count wording. Cover all transitions,
including correct → wrong → correct → correct, repeated correct answers after Learned,
shared streaks across study modes and completed mocks, both contributing statuses,
status colors with text/icons, and blank/unfinished answers preserving status.

# 06 — Progress projections

## Goal

Derive all visible progress from the learner's recorded facts, with one consistent
latest-attempt rule across dashboard, study groups, and progress.

## Work

- In learner-state/domain, combine stored study attempts with selected answers from
  completed mocks into one durable chronology per stable question key. Classify the latest
  valid attempt as correct, mistaken, or untried while retaining earlier history. Blank
  answers and unfinished selections do not enter that timeline.
- Derive solved count and rounded whole-number percentage for all 310 questions and for
  each group's actual question count. Derive question totals, attempt counts, and
  completed/passed/failed/unfinished mock summaries.
- In learner-state/application, expose named Reatom computed projections. All pages
  consume these projections so a later wrong answer immediately lowers overall and group
  solved counts without a route refresh.

## Complete when

Two solved questions show 1% overall; one solved question shows 0% overall; one solved
question in the 27-question Constitution group shows 4%. A later mistake reverses solved
status without deleting history. Blank and unfinished mock answers leave otherwise untried
questions untried.

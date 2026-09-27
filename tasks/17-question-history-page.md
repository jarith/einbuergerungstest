# 17 — Question history page

## Goal

Show a question's current status and every valid prior attempt, then provide an entry to
study that question again.

## Work

- In pages/question-history, add /progress/questions/:questionKey with a loader for the
  validated bank question and its chronological attempts; its render mounts
  QuestionHistoryPage with loading/error/not-found states.
- Show the German question, latest status/choice, correct choice, date and source (study
  or completed mock), and earlier attempts. Use text/icons as well as color; a question
  with no attempts has an untried state.
- "Study this question" opens the Study route with a validated question key. Link back to
  the all-question list without importing that page.

## Complete when

Retry and completed-mock attempts appear in order, while blank mock answers and unfinished
selections never appear as question attempts.

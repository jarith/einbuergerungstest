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
  with no attempts has a Not started state.
- "Study this question" opens the Study route with a validated question key. Link back to
  the all-question list without importing that page.

Use gray for Not started, red for Needs review, orange for Learning, and green for Learned,
with localized text or icons alongside color. Follow the
[learning-status requirements](../docs/requirements.md#question-learning-status).

## Complete when

Retry and completed-mock attempts appear in order, while blank mock answers and unfinished
selections never appear as question attempts.

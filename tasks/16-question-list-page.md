# 16 — Question list page

## Goal

Let the learner browse all 310 bank questions and find a question by its latest status.

## Work

- In pages/question-list, add /progress/questions with a loader for the bank index and
  status projection; its render mounts QuestionListPage with loading/error handling.
- Show question number, German prompt excerpt, correct/mistaken/untried label, attempt
  count, and image marker. Provide all/status filters and manageable progressive display
  for the full list.
- Open a selected question's history through its stable key. Keep filtering and
  presentation state page-local; use module projections for status.

## Complete when

All 310 questions are reachable without horizontal overflow, status filters match Progress
totals, and every row opens the correct history page.

# 08 — Ordered study flow

## Goal

Let a learner work through all 310 questions in bank order with immediate feedback, repeat
attempts, and a saved all-question position.

## Work

- In learner-state/application and page-local study.model.ts, resolve the current question
  from the ordered bank and saved position. Move previous/next within bounds, save the
  sequential position, and show completion after the final question instead of advancing
  past the bank.
- A selected answer is recorded immediately as a study attempt and reveals
  correct/incorrect feedback plus the correct choice. Retry reopens selection and records
  a new attempt, preserving earlier attempts.
- A question opened from progress uses a validated question key; the page may inspect and
  retry it without silently replacing the saved sequential position. The saved English
  translation preference applies throughout.

## Complete when

Question 1 starts a fresh pass, navigation follows the bank's display order, answers
remain visible when revisited, and the position/translation survive a reload. The
[Study page](09-study-page.md) presents this flow.

## Routing contract

`/study` replaces the entry with `/study/:questionKey?mode=sequential`, selecting the
saved or first position. The path parameter selects the displayed question. Sequential
Previous/Next/Restart actions save the position and push the next question URL into browser
history. Loading a URL, reloading, or traversing Back/Forward does not rewrite that saved
position. Completion remains on the final question and is restored on sequential reload.

An unmarked `/study/:questionKey` is isolated inspection: answering, retrying, and navigating
questions preserve the saved sequential position. The query mode keeps that distinction
across reload and history without introducing a second source for the displayed question.

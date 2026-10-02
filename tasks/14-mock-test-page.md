# 14 — Mock test page

## Goal

Present the 33-question live sitting without revealing grades before it ends.

## Work

- In pages/mock-test, add /mock-test with a loader for current sitting/start state,
  ordered paper questions, and deadline; its render mounts MockTestPage with loading/error
  handling.
- Show the remaining timer, question position, German-only question and choices,
  answered/unanswered count, previous/next and question-list navigation. Allow a selected
  answer to be changed until finalization.
- Build the unanswered submission dialog, with a way back to the question list, and an
  early-exit confirmation. The shell/back navigation guard must protect every departure
  path while allowing confirmed exit and finalization.
- Reuse question/image presentation, including enlargement, but suppress immediate
  correctness and translation controls during the live sitting.

## Complete when

The page works across temporary backgrounding, timeout, touch viewports, answer changes,
submission cancellation, and confirmed leaving.

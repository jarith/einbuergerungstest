# 10 — Dashboard page

## Goal

Make the dashboard the clear entry point for study, group study, and mock tests while
showing current progress and the optional real-test countdown.

## Work

- In pages/dashboard, add a / route with a loader for bank/group metadata, learner-state
  readiness, and offline status; its render mounts DashboardPage and handles
  loading/error/retry.
- Show first-use and returning states from the design: three main actions, exam format (33
  questions, 60 minutes, 17 to pass), solved count out of 310, whole-number percent, and
  every group's solved/total/percent.
- Use local calendar dates for future-day count and a today message. Link to Settings when
  no date is set or the learner wants to edit it. Consume live progress selectors so study
  and completed mock answers update the view.

## Complete when

The dashboard agrees with Progress and each group picker count, including a later wrong
answer lowering the solved count. First use and date states are legible at all designed
viewport sizes.

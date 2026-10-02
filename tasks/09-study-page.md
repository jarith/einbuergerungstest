# 09 — Study page

## Goal

Present ordered all-question study in StudyPage, structured so the group-study task can
use the same component and match the desktop, iPad, and iPhone design states.

## Work

- In pages/study, register /study with a loader for the ordered bank, validated target
  question, saved all-question position, and attempts; its render mounts StudyPage with
  loading/error handling. Task 11 adds the group variant route to this page.
- Show scope label, current position/total, German question and choices, optional English
  translation, responsive image and enlargement, Previous and Next controls, immediate
  answer feedback, retry, and scope-specific completion. Use text/icons as well as color
  for correctness.
- Keep the flow in its Reatom model and module actions. The page only binds controls and
  composes page-owned components; it must not duplicate answer rules or import the
  group-picker page. Accept a scope view model so group mode can reuse the same view.

## Complete when

All-question study works for 310 questions. Direct question links, reload, German UI, and
illustrated questions render correctly on desktop and touch viewports. Task 11 completes
the group mode on this same page.

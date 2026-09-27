# 12 — Study groups page

## Goal

Give learners a localized picker for all question groups and a clear route into each
group's study flow.

## Work

- In pages/study-groups, add /study/groups with a loader for localized
  titles/descriptions, question counts, saved positions, and live group progress; its
  render mounts StudyGroupsPage with loading/error handling.
- Show all 13 groups in bank order, including Berlin, with title, knowledge area
  description, question count, and start/continue action. Include a direct action for
  studying all 310 questions.
- Navigation uses route paths, not imports from the Study page. Reuse the shared progress
  projection for solved counts and the translation-independent localized group metadata.

## Complete when

The picker matches the design's long mobile layout and every group shows correct
English/German metadata, count, and saved-position action.

# 11 — Group study flow

## Goal

Scope ordered study to one of the bank's 13 question groups while sharing attempt history
and progress with all-question study.

## Work

- Filter the bank by a validated group ID, retaining original bank order and including
  Berlin. Reuse the ordered-study answering and feedback actions rather than creating a
  second attempt model.
- Persist a separate position for every group. Entering one group resumes its own
  question; visiting another group does not move it. A pass ends after that group's last
  question and shows its completion state.
- Add /study/groups/:groupId in pages/study/study.route.ts with a loader for the validated
  group, ordered subset, saved position, and attempts. Its render mounts the existing
  StudyPage in group mode with loading/error handling.
- All attempts update the question's common latest status and therefore both overall and
  group progress. All-question study also contributes to the relevant group's progress.

## Complete when

The Constitution group begins at source question 1 and next shows source question 3;
Berlin begins at source question 301 and finishes at 310. Switching groups and reloading
preserves each position.

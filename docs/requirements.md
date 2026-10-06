# Berlin Einbürgerungstest preparation app

## Purpose and source material

The app prepares a learner for the Berlin Einbürgerungstest with the supplied
[`questionbank-berlin.json`](../web/public/questionbank-berlin.json). The file contains
300 general and 10 Berlin questions, four answer choices per question, English text for
every question and choice, and local image resources for the 13 illustrated questions. The
German text and answer choices are the exam content. The question bank and its images are
fixed and will never change; no content versioning or saved-history migration is required.
The English translations are an unofficial study aid; the app does not need an additional
translation notice.

The
[BAMF test guide](https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html)
and
[section 1 of the Einbürgerungstestverordnung](https://www.gesetze-im-internet.de/einbtestv/__1.html)
confirm the exam format: 33 questions, comprising 30 general and 3 from the learner's
state; four choices with one correct answer; 60 minutes; and a pass threshold of 17
correct answers. The official questionnaires are unpublished. The app therefore generates
its own uniformly random practice papers with no duplicate question within a paper while
matching the published format.

## Product scope

- Ordered study covers all 310 questions, including the illustrations, with immediate
  answer feedback and repeat attempts. German question and answer text remains visible. In
  English UI, a translation toggle adds English text for the question and every answer
  choice alongside the German original. The toggle remains in its chosen state across
  questions, reloads, and switches away from and back to English UI. It is absent in
  German UI.
- The dashboard is the entry point for studying every question group in the supplied bank,
  including Berlin. Each group shows its title, knowledge-area description, question
  count, progress bar, and a direct study link. A new group offers “Study group”; an
  unfinished group offers “Continue group”; a completed pass offers “View completed
  group.” There is no separate group picker page or “Study by group” dashboard button or
  link. Titles and descriptions are shown in the selected UI language, including German
  translations in German UI. Selecting a group starts the regular study flow with only
  that group's questions, in question-bank order. Answer feedback, repeat attempts,
  translation, and recorded question history follow the same rules as all-question study.
  Each group keeps its own study position, and a pass finishes after its last question. An
  unfinished group's action also shows “Continue at question {position} of {total},” using
  its saved one-based position in the group, independently of its progress count. New
  groups and completed passes do not show this resume hint. Group-study back links return
  to the dashboard. The existing Study action continues to cover all 310 questions.
- A live mock test uses German content only. Answer selection can be revised, and grading
  is withheld until the test ends. In English UI, a completed test's review offers a
  translation toggle that shows English questions and choices beside the German original.
  The control is absent in German UI.
- The progress view shows each question's latest status and prior attempts, lets the
  learner open a question in study mode, and summarizes completed and unfinished mock
  tests. A blank answer scores zero in its completed test but leaves an otherwise
  unanswered question in Not started status in overall progress.
- All app interface text, including navigation, settings, study feedback, and mock-test
  controls and results, is available in English and German. A new learner starts with
  English UI and can change the UI language in Settings. This preference affects interface
  text and available translation controls, but never replaces the German question-bank
  content or translates a live mock test.
- Settings lets the learner choose an optional planned date for the real test. Today or a
  future date is accepted; an earlier date is rejected with visible feedback. The learner
  can change or clear the date at any time. The dashboard shows the number of local
  calendar days until a future test and a today message on the test date. When the app is
  next opened after that date, it clears the date and removes the message.
- The main dashboard shows the number of questions contributing to progress out of 310 and
  the corresponding percentage rounded to the nearest whole number. Learning and Learned
  questions each contribute one question; Needs review and Not started contribute zero. A
  second consecutive correct answer changes Learning to Learned without counting the
  question again. Thus 50 contributing questions appear as 50/310 and 16%, while 2 appear
  as 2/310 and 1%.
- The dashboard also shows the contributing question count, total question count, and a
  whole-number percentage for every group. Each group uses the same status rules and
  rounding as overall dashboard progress. Answers from all-question study, group study,
  and completed mock tests all contribute to the same question history and update both the
  relevant group and the overall total.
- Device-local progress must work without an account or network connection. Export and
  import move complete history and settings, including UI language, translation
  preference, and planned test date, between browser and installed app. Import previews
  the backup and requires confirmation before replacing existing data. Invalid backups
  must leave existing data intact.
- The app offers a confirmed reset of local progress.
- The PWA provides a standalone launch, suitable icons, numbered iOS and Android install
  guides directly in Settings, and offline access to the app, questions, and images after
  online preparation. Each online launch or foreground return checks for and automatically
  applies the latest completely downloaded release without an update prompt or manual
  reload. Active mock tests and pending saves defer activation. Offline openings keep the
  prepared copy without checking for or applying updates. Ordinary browser visits are
  online-only and receive the current deployment on refresh, without offline preparation
  or update notices. Layouts must remain usable at iPhone and iPad sizes, including touch
  controls and display safe areas. Answer correctness and question status must be conveyed
  with text or icons in addition to color.

## Study sessions and repeated answers

Opening all-questions study starts a new session at the saved study position. Opening
another group starts a session at that group's saved position. Opening a question from
Progress starts a fresh session at that question, including when it has previous attempts.
Progress filters let the learner choose questions in a particular learning status.

Each question can be answered once per session. There is no Retry question button or
in-session action to clear an answer and submit another attempt. Answer selections and
immediate correct or wrong feedback belong to the current session. Moving between
questions, including navigating backward and forward, preserves feedback for answers given
during that session and keeps those answers locked.

To answer a question again, the learner enters a new study session through the Study route
or opens the question from Progress. Leaving study and entering it again, changing study
mode or group, reloading the app, or restarting a completed pass clears session answers.
Previously answered questions show no selected answer or answer-correctness highlights
until answered in the new session. Starting a new session preserves the saved study
position; the explicit restart action for a completed pass starts at the first question.
These rules apply to all-questions study, group study, and questions opened from Progress.

Every submitted answer contributes to persistent attempt history and learning status.
Clearing session feedback never deletes attempts or changes question statuses,
consecutive-correct counts, or overall and group progress. Learning-status badges remain
visible even when the new session has no selected answer. Session answers are temporary
and are not included in saved progress or backups. Question-history pages continue to show
recorded attempts and their correctness.

## Supportive feedback and completion

Use a calm, factual voice. Acknowledge meaningful effort without streak pressure, points,
confetti, sound, jokes, random praise, or delays before the next action. Keep the existing
palette, typography, and semantic text/icon cues. These presentation rules do not change
learning status, scoring, saved positions, or the one-answer-per-session rule.

### Finishing a group

Lead with “You reached the end of this group.” and a small check beside the heading. Show
the group title, “Reached all {total} questions,” and “Good work making time to practise.”
Keep the exact contributing count and percentage separate from the completion check:
finishing a pass does not mean every answer is correct or every question is Learned. Use
quieter supporting text: “Your latest answers set progress. Earlier attempts stay in
question history.” Preserve the actions to review the group's questions and return Home.
Review starts another pass with prior attempts preserved. Reopening a completed group
shows the same settled completion state.

### Study feedback

When a submitted study answer changes the question from Learning to Learned, show “Correct
— now marked Learned” and “Two correct answers in a row.” Use the existing success color
and a check, without a toast, automatic advance, or focus move. Ordinary correct answers,
including answers that leave an already-Learned question Learned, show “Correct.” The
milestone belongs to that answer's session feedback: retain it when moving back and
forward within the session, without replaying an effect. A new session clears this
feedback under the existing rules. Completed mock tests still update learning status, but
do not emit a separate study milestone for each question.

Incorrect feedback remains explicit. When the English study translation is on, show the
correct answer's existing English translation directly beneath the German correction. Keep
the German answer primary, reuse the bank translation verbatim, and hide the English line
when translation is off or the UI is German. Do not add unverified explanations or
motivational copy to individual question content.

### Mock-test results

Keep the actual score, passing threshold, unanswered count when applicable, and finish
reason visible. Below a failed result, add “Use the review below to work through the
questions you missed.” On desktop, where review sits beside the summary, use “Use the
review to work through the questions you missed.” Time-expired results retain “Time is up.
Saved answers were graded automatically.” before the supportive next step.

A passing result says “Mock test passed,” with the actual score, a small check, and “Well
done.” It does not imply a guaranteed real-test outcome. Keep review available for both
outcomes; no new review filter or retry flow is introduced.

### Localization and interaction

Use these German equivalents in German UI, with the existing localized status vocabulary:

| English                                                                      | German                                                                                        |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| You reached the end of this group.                                           | Du hast das Ende dieser Gruppe erreicht.                                                      |
| Reached all {total} questions                                                | Alle {total} Fragen erreicht                                                                  |
| Good work making time to practise.                                           | Gut, dass du dir Zeit zum Üben genommen hast.                                                 |
| Your latest answers set progress. Earlier attempts stay in question history. | Deine letzten Antworten bestimmen den Fortschritt. Frühere Versuche bleiben im Fragenverlauf. |
| Correct — now marked Learned                                                 | Richtig — jetzt als Gelernt markiert                                                          |
| Two correct answers in a row.                                                | Zweimal in Folge richtig beantwortet.                                                         |
| Correct                                                                      | Richtig                                                                                       |
| Continue at question {position} of {total}                                   | Weiter bei Frage {position} von {total}                                                       |
| Use the review below to work through the questions you missed.               | Sieh dir unten die Fragen an, die du falsch oder nicht beantwortet hast.                      |
| Use the review to work through the questions you missed.                     | Sieh dir die Fragen an, die du falsch oder nicht beantwortet hast.                            |
| Mock test passed                                                             | Probetest bestanden                                                                           |
| Well done.                                                                   | Gut gemacht.                                                                                  |

These treatments are static by default. They remain understandable without motion or
sound, preserve keyboard focus and touch targets, and must wrap rather than truncate in
both languages. Announce new answer feedback once as a polite status, without repeating
the announcement on back/forward navigation. Do not delay answering or navigation to stage
feedback. The `.pen` frames and annotations specify the presentation; they do not
constitute runtime interaction or assistive-technology verification.

## Question learning status

A question's current status is derived from its chronological answer history, using
consecutive correct answers since its most recent wrong answer. Earlier attempts remain in
history when the status changes.

| Status       | Meaning                                    | Color  | Contributes to progress |
| ------------ | ------------------------------------------ | ------ | ----------------------- |
| Not started  | No recorded answer yet.                    | Gray   | No                      |
| Needs review | The most recent recorded answer was wrong. | Red    | No                      |
| Learning     | One consecutive correct answer.            | Orange | Yes, one question       |
| Learned      | At least two consecutive correct answers.  | Green  | Yes, one question       |

Every recorded answer applies the following transition:

| Current status | Correct answer | Wrong answer |
| -------------- | -------------- | ------------ |
| Not started    | Learning       | Needs review |
| Needs review   | Learning       | Needs review |
| Learning       | Learned        | Needs review |
| Learned        | Learned        | Needs review |

A wrong answer resets the consecutive-correct count to zero, including for a Learned
question. The question then needs two new consecutive correct answers to become Learned.
For example, correct → wrong → correct leaves a question Learning; one more correct answer
makes it Learned. Further correct answers keep it Learned.

The same rules apply across all-question study, group study, and completed mock tests; the
two correct answers need not come from the same mode or session. Blank answers in
completed mock tests and selections in unfinished mock tests do not create attempts,
change question status, or reset the consecutive-correct count. Mock-test scores still use
the correctness of answers in that test, independently of learning status.

Use these four statuses consistently in question indicators, totals, filters, and history.
Provide localized labels in English and German, with text or icons alongside the colors.
Progress counts Learning and Learned equally, while status totals distinguish them.

The executable acceptance specification is in [`e2e/features/`](../e2e/features/). Its
existing status and total assertions use this four-state terminology. The glossary is in
[`CONTEXT.md`](./CONTEXT.md), and the device-local storage decision is in
[`adr/0001-device-local-progress.md`](./adr/0001-device-local-progress.md).

## Platform note

[Apple's Home Screen web app guidance](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)
says installed web apps have storage separate from the browser and do not copy other local
storage during installation. The install guide should explain how to export progress in
Safari and import it into the installed app when needed.

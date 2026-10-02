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
- A separate group-study action opens a picker for every question group in the supplied
  bank, including Berlin. Each choice shows its title, knowledge-area description, and
  question count. Titles and descriptions are shown in the selected UI language, including
  German translations in German UI. Selecting a group starts the regular study flow with
  only that group's questions, in question-bank order. Answer feedback, repeat attempts,
  translation, and recorded question history follow the same rules as all-question study.
  Each group keeps its own study position, and a pass finishes after its last question.
  The existing Study action continues to cover all 310 questions.
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
- The PWA provides a standalone launch, suitable icons, an install guide for iPhone and
  iPad, and offline access to the app, questions, and images after installation. Layouts
  must remain usable at iPhone and iPad sizes, including touch controls and display safe
  areas. Answer correctness and question status must be conveyed with text or icons in
  addition to color.

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

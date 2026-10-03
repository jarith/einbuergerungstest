# Einbürgerungstest Berlin

This context describes preparation for the Berlin version of the German Einbürgerungstest.

## Language

**UI language**: The learner's preferred language for app controls and navigation,
distinct from the German question-bank content.

**Study translation**: Text in the UI language shown alongside the original German
question and answer choices during study.

**Question bank**: The 310 possible Berlin test questions: 300 general questions and 10
questions specific to Berlin.

**Question group**: A themed subset of the question bank. Each question belongs to exactly
one group.

**Study session**: Ordered practice through the question bank with immediate feedback and
one answer per question per session. Selected answers and correct or wrong feedback are
retained while navigating within the session. They are cleared when the learner leaves and
returns, changes study mode or group, reloads the app, or restarts a completed pass. There
is no in-session Retry action. To answer again, enter a new session through Study or open
a question from Progress, where questions can be filtered by learning status. Saved study
positions, learning statuses, and attempt history are separate from session feedback. The
acknowledgment when an answer changes Learning to Learned belongs to that session answer;
revisiting it retains the message without announcing it again. Later correct answers to an
already-Learned question use ordinary correct-answer feedback.

**Group study session**: Ordered practice limited to one chosen question group, with the
same session feedback, one-answer rule, and shared attempt history as all-questions study.
Re-entering a group preserves its position and allows fresh answers.

**Mock test**: A timed practice sitting modeled on the Berlin Einbürgerungstest, with 30
general and 3 Berlin questions. Answers may be revised until the test ends; results are
revealed afterward.

**Completed mock test**: A mock test that was submitted or reached its time limit. Only
completed mock tests count as tests tried.

**Unfinished mock test**: A mock test exited before completion. It remains in test history
without a score and does not count as a completed test. Its selections may be reviewed,
but the test cannot be resumed.

**Question attempt**: A selected answer to one question, made in a study session or a
completed mock test. A blank mock-test answer and a selection in an unfinished mock test
do not count as question attempts.

**Question status**: The current learning state derived from chronological question
attempts: Not started (no attempts, gray), Needs review (latest answer wrong, red),
Learning (one consecutive correct answer, orange), or Learned (at least two consecutive
correct answers, green). Any wrong answer resets the consecutive-correct count to zero.
Earlier attempts remain in history. See the
[transition rules](requirements.md#question-learning-status).

**Question contributing to progress**: A question in Learning or Learned status. Each
counts once, with equal weight. A wrong answer removes its contribution until the next
correct answer. This replaces the earlier term “solved question.”

**Dashboard progress**: The share of the 310-question bank currently in Learning or
Learned status, rounded to the nearest whole percent.

**Group progress**: The share of a question group currently in Learning or Learned status,
rounded to the nearest whole percent.

**Test date**: The learner's optional planned date for taking the real Einbürgerungstest,
distinct from a mock-test sitting.

## Interface conventions

The approved distill pass keeps all 13 groups, their complete descriptions, progress, and
resume hints. Progress and All questions show bank-wide counts within the status filters;
filtering or pagination must not change those counts. Study help is a collapsed disclosure
below navigation on every screen size. Backup download, file selection, and the full
comparison preview belong together, with replacement and reset confirmations preserved.
These simplifications do not change learning, scoring, or persistence rules.

At desktop widths (1024px and above), Study, Mock test, and Settings use a container
measuring 50% of the viewport width, centered within the main area beside navigation. Page
headings and content share this alignment. The live mock summary stacks below the
questions. Mobile and tablet retain their existing widths.

Mobile navigation stays fixed at the bottom of the viewport. The mock-test exit
confirmation uses “Stay in test” / “Im Test bleiben” to retain the active attempt.

The calendar displays dates as `DD.MM.YYYY` while storing `YYYY-MM-DD`. Settings disables
past popup dates with `excludeDate`, allowing typed past dates to reach the existing field
validation and show an error. Mantine's `minDate` silently suppresses those value changes.

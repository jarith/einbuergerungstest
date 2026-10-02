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

**Study session**: Ordered practice through the question bank with immediate feedback
after each answer.

**Group study session**: Ordered practice limited to one chosen question group, with the
same answer feedback and attempt history as a study session.

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

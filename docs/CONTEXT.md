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

The dashboard donut and group bars show exact status proportions in this order: Not
started, Needs review, Learning, Learned. Whole-number labels do not determine segment
sizes; 100% contributing can still include Learning, and only all Learned is fully green.
The overall legend previews slices on pointer hover or keyboard focus and toggles a
persistent selection on touch, Enter, or Space. Mouse clicks do nothing; mouse interaction
only previews on hover. Escape or an outside press clears the highlight. Zero-count
statuses remain selectable without drawing or dimming slices. Desktop and tablet center
the chart beside its legend; mobile places a compact two-column legend below, with inline
count and percentage values. Group bars expose their group's contributing count and four
status counts and percentages in a tooltip on mouse hover or keyboard focus. Touch does
not open these tooltips. Study shows the same status bar immediately below its scope
title, using totals for the current group or all questions and updating after answers. The
Citizenship test header is hidden during study below the 1024px desktop breakpoint.

**Test date**: The learner's optional planned date for taking the real Einbürgerungstest,
distinct from a mock-test sitting.

## Interface conventions

Interface copy describes the combined Learning and Learned count as “learning or learned”
(“im Lernen oder gelernt” in German). The German Learning label is “Im Lernen”. Titles and
headings omit trailing full stops; explanatory sentences keep normal punctuation.

The approved distill pass keeps all 13 groups, their complete descriptions, progress, and
resume hints. Progress shows bank-wide counts within the status filters; filtering or
pagination must not change those counts. Study help is a collapsed disclosure below
navigation on every screen size. Backup download, file selection, and the full comparison
preview belong together, with replacement and reset confirmations preserved. Backup,
import, and reset controls are available only in Settings, with no backup link or
disclosure on Progress. The question browser lives on `/progress`; the separate
`/progress/questions` list route is removed. Question status is the default Progress tab;
Mock tests uses `/progress?tab=mock-tests`, owned by the Reatom route search codec. Tab
navigation retains keyboard focus. All 13 question groups remain visible and expand
independently through the Mantine-based design-system Accordion. The first two groups
start expanded. Filters apply to every question before each group's pagination; each
expanded group previews 10 matches in bank order and reveals 10 more on request. Changing
the filter resets all group limits. Group status bars always describe the full group.
Filters, expanded groups, and revealed counts survive tab and question-history navigation
for the current loaded learner. Browser Back preserves the departure scroll position. List
separators appear only between items, and hoverable rows retain padding in every state.
The dashboard omits the “Saved on this device” notice. These simplifications do not change
learning, scoring, or persistence rules.

At desktop widths (1024px and above), Study, Mock test, and Settings use a container
measuring 50% of the viewport width, centered within the main area beside navigation. Page
headings and content share this alignment. The live mock summary stacks below the
questions. Mobile and tablet retain their existing widths.

Mobile navigation stays fixed at the bottom of the viewport, above page controls. The main
content establishes its own stacking context so segmented controls cannot cover
navigation. The mock-test exit confirmation uses “Stay in test” / “Im Test bleiben” to
retain the active attempt.

Forward navigation starts at the top and focuses the destination heading after its content
renders. Question navigation focuses the German question heading; answering does not move
focus. Browser Back/Forward keeps native scroll restoration. A single pointer tap on the
active primary-navigation destination stays in the current session; two consecutive taps
within 400 ms scroll to the top without reopening the route or adding history. Keyboard
activation performs that action immediately. Reduced-motion preferences disable smooth
scrolling. Cancelled pointer gestures clear the tap sequence.

Touch targets for the translation switch and dialog close control are at least 44px.
Full-screen image dialogs account for all display safe areas. The document theme color
follows the saved appearance; the manifest launch background remains the default light
appearance. Installed iOS/Android system bars and safe areas require real-device checks.

The calendar displays dates as `DD.MM.YYYY` while storing `YYYY-MM-DD`. Settings disables
past popup dates with `excludeDate`, allowing typed past dates to reach the existing field
validation and show an error. Mantine's `minDate` silently suppresses those value changes.

## Public website

The public introduction uses fixed language URLs: `/` for German and `/en/` for English.
It is readable without JavaScript, question-bank loading, or learner storage. The learner
dashboard is `/dashboard`, including the installed app start URL. Only the two public
pages are indexable; learner screens remain device-local, non-indexable app routes. The
canonical origin is `https://einbuergerungstest.jarith.dev`. See [SEO](seo.md) for the
deployment contract and outstanding launch checks.

The landing page has one dashboard button and no other app links; language choices stay on
the public routes. It omits the separate Berlin/translation sections and independent-tool
notice. Installation help covers iOS Safari and Android Chrome. Both numbered guides live
directly on `/settings`, alongside progress-transfer and offline-preparation guidance.
They use two columns when the content container is at least 40rem wide and stack below
that width. There is no separate installation route; `/settings/installation` returns 404
and is excluded from both the Cloudflare rewrite allowlist and the service-worker
navigation fallback.

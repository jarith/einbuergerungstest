# Keep progress on the device with manual backup

Store study and mock-test history on the learner's device so the app works offline without
accounts or a backend. Offer a complete export and import for backup and for moving
progress into an installed iPhone or iPad web app, because
[WebKit keeps Home Screen app storage separate from the browser](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/).
An import replaces existing local progress only after preview and confirmation; this
avoids ambiguous merges of repeated question and test attempts.

All study modes keep the current session's answer selections in memory, separately from
persisted attempt history and study positions. A question can be answered once per
session; there is no per-question retry state or action. Navigating between questions
retains the feedback. Leaving the flow, changing mode or group, reloading, or restarting a
completed pass discards it. Entering Study again or opening a question from Progress
starts a fresh session that allows another answer while retaining learning statuses and
history. Session feedback is not part of exported backups.

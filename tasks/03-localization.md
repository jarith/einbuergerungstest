# 03 — Localization and preferences model

## Goal

Make all interface text available in English and German while retaining German exam
content and an independent English study-translation preference.

## Work

- Add i18next/react-i18next as direct app dependencies and initialize them from the saved
  UI language after learner hydration. A fresh learner starts in English regardless of
  browser language. Bundle both catalogs with the app for offline use.
- Keep interface strings, counts, dates, validation, feedback, navigation, dialogs, and
  accessibility labels in the catalogs. Use locale-aware formatting and correct
  singular/plural forms.
- Display group titles/descriptions from the localized bank metadata. Always display
  German questions and choices. The study translation starts off for a fresh learner. In
  English UI, the saved toggle adds English text beside German during study and completed
  reviews. Hide the control in German UI without clearing its saved value. A live mock
  never offers translations.
- Connect saved light/dark appearance to the existing DesignSystemProvider. Keep the
  preference in learner state so export/import includes it.

## Implementation boundaries

See the [refined run plan](03-run-plan.md) for decisions and verification. Declare direct
runtime dependencies in the root manifest, as required by this repository's workspace
rules. Bootstrap exposes `localization` after learner hydration. Its preferences are
derived from committed learner state, including import and reset; callers save changes
through `learner.updatePreferences`.

Reatom views read `localization.t()` for typed messages, `appearance()` for the saved
theme, and `getGroup(group)` for bank metadata. Use `canTranslate(context)` to show the
translation control and `getQuestion(question, context)` to obtain German text with
optional English alongside it. Context is required so a live mock cannot accidentally use
the study translation preference. Render German and English text with their own `lang`
attributes in task 05. Use catalog plural messages for counts, `formatNumber` for numbers
and percentages, `formatDate` for timestamps, and `formatPlannedDate` for saved local
calendar dates. Add new page copy to both catalogs as each page is implemented; never
display raw infrastructure exception messages as translated UI feedback.

This task provides the shared localization foundation and integrates the current root. The
router, settings controls, and actual study/review screens remain in their numbered tasks.
Their page-level acceptance scenarios become executable with those screens.

## Complete when

Switching UI language and reloading preserves the preference; switching through German
hides but does not erase the English study-translation choice. This task precedes the
[shell](04-router-shell.md) and [settings page](07-settings-page.md).

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

## Complete when

Switching UI language and reloading preserves the preference; switching through German
hides but does not erase the English study-translation choice. This task precedes the
[shell](04-router-shell.md) and [settings page](07-settings-page.md).

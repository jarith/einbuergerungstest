# 07 — Settings page

## Goal

Implement the Settings & backup screen shown in the design, with durable preferences and
safe learner-data controls.

## Work

- In pages/settings, add settings.route.ts with a loader for hydrated settings,
  planned-date state, and backup summary; its render handles loader status and mounts
  SettingsPage. Keep page-specific sections and dialogs under
  components/settings-page/components.
- Offer English/German UI language, light/dark appearance, and a local-calendar planned
  test date. Accept today or a future date, reject a past date with visible feedback, and
  allow the date to be changed or cleared.
- Show export, file import, preview comparing the selected backup with this device,
  explicit replacement confirmation, invalid-file error, and confirmed reset. Use
  learner-state actions so import/reset affect Reatom and IndexedDB together. Provide a
  link to installation guidance.
- Make backup/reset controls reusable for the Progress page without importing one page
  from the other.

## Complete when

All settings survive reload and backup transfer; a past date or invalid import does not
change stored data; canceling import/reset is harmless.

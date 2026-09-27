# 20 — PWA and release integration

## Goal

Ship the finished app as a standalone, offline-capable PWA with safe updates and a
verified mobile experience.

## Work

- Add manifest metadata, app name, theme colors, suitable icons, standalone display, and
  mobile viewport/safe-area behavior.
- In app/offline and the build, precache the shell, built code/styles/fonts, manifest and
  icons, both UI catalogs, the JSON bank, and every responsive/full illustration with
  Workbox `generateSW` from the built output. Include JSON and WebP files explicitly in
  its generated precache. Report "ready offline" only after this full required set is
  cached. Show resource failures and retry.
- Prepare an update's assets before activation and defer the switch while a live mock is
  in progress. Keep IndexedDB learner data independent of service-worker caches. Recheck
  saved-history compatibility when official question content changes.
- Verify a cold installed launch, offline reload, study, illustrated question, progress,
  and backup transfer at desktop, 820×1180, and 390×844. Run typecheck, lint, format
  check, build, and relevant acceptance scenarios. Add no unit tests; reconcile the
  starter template's unit-test CI gate with this project's requested delivery scope.

## Complete when

After preparation the installed app opens and studies all questions and images offline,
updates do not interrupt a live sitting, and all task-level completion checks in
[README.md](README.md) are satisfied.

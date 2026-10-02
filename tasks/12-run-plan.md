# Task 12 — Study groups picker execution plan

1. Add a route-owned page model combining the bank's thirteen localized groups, shared
   live progress totals, and each group's saved position in bank order.
2. Compose the design's introduction, all-question link, progress explanation, and numbered
   group rows. Use two columns on larger screens and a long single column on phones.
   Show start/continue actions and an explicit action for a completed pass.
3. Audit all group metadata/counts, English/German UI independent of study translation,
   saved-position actions, shared live progress, route recovery, keyboard access, and
   desktop/tablet/phone layouts. Run lint, TypeScript and existing tests; add no tests.
4. Repeat the audit and checks, format once, and commit locally without pushing.

## Tracking

- [x] Inspect documentation, group metadata, task 11 integration, and picker design.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both audit cycles verified all thirteen groups in bank order, exact English/German titles
and descriptions, bank-derived counts, live progress, and saved-position actions. Every
entry opens its own group; entering a group changes its action to Continue, Constitution
resumes source 3, completed Berlin opens completion, and the all-question action retains
its independent position. Completed mock history contributes 1/27 (4%); a second correct
answer still counts once and a wrong answer reduces it to 0/27 (0%). Metadata follows UI
language independently of the question translation setting.

Compared desktop, tablet, and long phone layouts with the picker design. Checked English
light and German dark, all thirteen rows, visible keyboard focus, and 320px with 200% text
without horizontal overflow. Axe reported no violations in inspected states. Extended the
shared content-margin reset to the picker headings and ordered list to restore the
intended alignment and spacing. The existing shell and design-system tokens are reused;
required progress counts use the current status terminology rather than “solved.”

A delayed bank request showed loading and then an actionable failure. The first audit
found that the route could retain an old error after parent retry had successfully loaded
new data. RoutePage now uses the loader's current rejected status to decide whether to
show that error. One retry now restores all thirteen groups; invalid-group handling is
preserved. Also fixed the blank line exposed by task 11's final formatter expansion.

Lint, TypeScript, 443 existing tests and 20 ast-grep suites passed in both cycles.
No tests were added and the unwired BDD suite was left unchanged.

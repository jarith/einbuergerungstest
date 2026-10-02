# Task 16 — Question list execution plan

1. Add a route-owned filter and progressive-display model over live bank/progress data.
2. Render numbered German prompt rows, four-state badges, attempt counts, image markers,
   status filters, totals and eight-at-a-time expansion. Link stable keys to history.
3. Audit all 310 entries, status totals, filter resets/empty state, correct links,
   localization, keyboard access and desktop/tablet/phone layout. Run required checks.
4. Repeat audit and checks, format once, and commit. Add no tests.

## Tracking

- [x] Inspect requirements, design and shared progress/status presentation.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles checked eight-row expansion through all 310 unique question links, four live
status totals (307 Not started and one in each other state in the seeded profile),
filter results/reset and empty state, correct stable-key history navigation, and
localized image/attempt metadata. Phone and German/dark tablet layouts were inspected
against the design, using the updated four-state labels instead of the obsolete three
labels in the mockup. Axe reported no violations, and 320px at 200% text had no overflow.
Fixed semantic-markup and strict-token diagnostics. Lint, TypeScript, 443 existing tests
and 20 ast-grep suites passed both final cycles. No tests added.

# Task 19 — Installation page execution plan

1. Add a shared offline/platform model and route data for current installation mode and
   readiness. Until task 20 supplies full precaching, report not prepared honestly.
2. Implement the designed introduction, four Safari steps and transfer panel, including
   separate storage and the installed copy's own online preparation. Link shared backup
   controls through Settings; localize English/German.
3. Audit Settings navigation, browser/standalone state, transfer wording, accessibility,
   both languages, and desktop/820×1180/390×844 layouts. Run lint, TypeScript and tests.
4. Repeat audit/checks, format once and commit locally. Add no tests.

## Tracking

- [x] Inspect design and platform requirements.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Two browser audits verified the four ordered Safari steps, Settings entry and backup
return links, English/German copy, and browser versus simulated iOS standalone mode.
Desktop, 820×1180 and 390×844 screenshots match the design's steps/transfer layout.
At 320px with 200% text there was no horizontal overflow; axe found no violations.
Native iOS installation requires a physical-device check; standalone detection was
simulated in Chromium. The offline model reports not prepared until task 20 connects
full precaching, so installation never implies offline readiness.

Both cycles ran lint, TypeScript and existing tests, fixing token/semantic issues.
The final checks passed with 443 tests and 20 ast-grep suites. No tests were added.

# Task 10 — Dashboard execution plan

1. Add a page-local dashboard model for local-calendar countdown and live progress metadata,
   and a connection-status model consumed by the hydrated dashboard loader.
2. Compose the design's study/group/mock entry actions, exam format, planned date, overall
   progress, device-local guidance, and all thirteen group progress summaries.
3. Audit first use/returning states, live count increases/decreases, completed mock contributions,
   local date boundaries, route retry, translations and responsive design. Run lint, TypeScript,
   and existing tests, fixing errors without adding tests.
4. Repeat the audit/check cycle, format once and commit locally.

## Tracking

- [x] Inspect requirements, acceptance specs, progress selectors, and design frames.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles checked all 13 groups, first use and returning progress, localized entry links,
33/60/17 exam facts, future/today/expired dates, and connection changes. Browser navigation
verified 1/310 = 0%, 2/310 = 1%, then a wrong answer lowering the count. Imported completed
mock history contributed 33/310 = 11%; a subsequent wrong study answer lowered it to 32/310 = 10%.
Local calendar arithmetic passed a DST boundary. A blocked bank request showed an error and
recovered through Retry. Desktop/light and tablet/phone German dark renders were inspected;
a long German title and the exam facts were fixed for 320px at 200% text, with no overflow.
Accessibility scans reported no violations and browser runtime reported no errors.
Lint, TypeScript and 443 existing tests plus 20 ast-grep suites passed in both cycles.
No tests were added. Current learning-status terminology takes priority over the older
solved labels in the design. Connection reporting does not claim PWA caching (task 20).

---
paths:
  - '**/*.test.{ts,tsx,js,jsx,mts,mjs}'
  - '**/__tests__/**'
  - '**/tests/**'
---

# Unit tests (Vitest)

Applies to Node Vitest test files only, excluding `*.browser.test.tsx`, `e2e/**`, and
design-system Playwright files. AGENTS.md §3–§6 are the contract; this file is the stack
detail.

## Shape of a test file

- One top-level `describe` per module or behaviour group; use the alias already used in
  this project (`test`).
- Inputs live in a named fixture (`const normalHike = {...}` or `makeX()`), expected
  values in `expected*` constants, the call result in `result`. Then
  `expect(result.field).toBe(expectedField)`.
- Type input fixtures with the module's own types (`const input: Order = {...}`) so
  TypeScript catches shape drift.
- Constants needed by one test are declared inside that test, not at file level.
- Local render/arrange helpers stay local to the file
  (`arrangeActiveTrip({ elapsedSec: 10 })`, object argument, named in domain terms). Only
  business assertions (`expect.extend`) and universal helpers such as `login` go global.

## Determinism

- Time: `vi.useFakeTimers()` + `vi.setSystemTime(new Date('2026-01-15T10:00:00Z'))` in the
  test or file setup. Never `Date.now()` in a test without it.
- Locale: explicitly set the locale in tests that format localized values; do not depend
  on the host locale.
- Random: seeded or injected; never `Math.random` in a test.
- Suspect non-determinism → run the file 10 times
  (`for i in $(seq 10); do mise exec -- yarn workspace @einbuergerungstest/web run -T vitest run src/path/to/file.test.ts || break; done`)
  and re-run with the printed seed; the agent does not do this on its own.

## Runner conventions

- Run one file:
  `mise exec -- yarn workspace @einbuergerungstest/web run -T vitest run src/path/to/file.test.ts`.
  Run everything: `mise exec -- yarn test:all` — always before finishing.
- Random order and Vitest seed output are enabled for the configured Node suites; a
  failure that disappears on re-run is a shared resource, not a fluke: reproduce with the
  seed.
- `it.todo('name')` is the way to propose a test list before implementing it. `it.only` is
  for local iteration only — never committed.
- Table-driven tests use `it.each([...])`. No template-string table syntax.

## Doubles in this project

- Substitution mechanism: module mocking (`vi.mock`) of the owner of an out-of-process
  side effect; never mock pure logic or the Reatom state being exercised.
- Network: intercept at the network boundary when needed. MSW was deliberately deferred;
  there is no prepared network helper. Existing `offline.model.test.ts` fetch stubs are
  known debt, not a pattern for new tests. Do not migrate them without a scoped task.
- Silence side effects by configuration in global setup (logger level, analytics off)
  before reaching for a mock. Test output must be noise-free — every line of it is what
  the agent reads.
- A `vi.fn()` that no `expect` ever inspects is a dummy `{}`/no-op.

## Property-based (fast-check) — when the task states an invariant

fast-check is not installed. Discuss adding it when a task needs property testing; do not
generate imports for an unavailable dependency. If the requirement states a postcondition
(cap, non-negativity, idempotency, round-trip, state-machine invariant), add a property
test next to the example tests: describe the input domain with generators (`fc.record`,
`fc.integer({min,max})`), assert the invariant, `{ numRuns: 500 }`. Property tests do not
replace boundary examples; keep both. Do not invent vague properties — five precise
examples beat a property that catches nothing.

## Snapshots

Avoid. Twenty lines of explicit assertions cost nothing; a snapshot that gets approved
blindly costs the whole test. If a snapshot already exists and fails: read the diff,
decide with a human, never run with `-u`.

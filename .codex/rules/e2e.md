---
paths:
  - 'e2e/**'
  - 'packages/design-system/**/*.test.ts'
---

# E2E tests (Playwright)

AGENTS.md §7 is the contract. Before adding an E2E test, run the `e2e-select` skill; every
E2E test states its criterion in a comment: irreversible / money-or-access / real external
boundary.

## Scope

- Normal flow only. Field validation, error states, hover, animation are not E2E material
  — one integration test proves validation is wired, unit tests prove the rules.
- Do not re-check at E2E level what an integration test already proved (a value computed,
  a row written). E2E asserts what the user sees at the end of the path (the "refund
  issued" badge, the certificate link), not just "request sent".
- Several assertions along the path are fine. A smoke subset (a few key paths) runs first;
  when smoke is red the heavy suite does not run.

## Data and roles

- Each test seeds its own state; tests never share or mutate common state. Dates that
  depend on "now" are offsets from `new Date()` at seed time, never absolute.
- Steps performed by another role or an external actor (admin approves, payment gateway
  confirms) are done through the API or the database, not through a second browser. List
  these steps explicitly in the task — models drop about half of them.
- For asynchronous or multi-actor scenarios use the two-phase approach: first "describe
  the asynchronous scenarios connected with X" → a human validates the list → then write
  the tests with that list as input.
- Umami analytics is the only external service identified. Learning and exam behavior must
  not depend on analytics availability; keep real analytics disabled in test environments.

## Stability

- Wait for **state** (element with a stable attribute appears / disappears), never for
  time. No `waitForTimeout`, no `sleep`.
- Keep the intermediate-state checks (spinner appeared, then result). Removing them "for
  stability" blinds the test to the action breaking.
- Locators: `getByRole` / `getByLabel` / `getByText`; `getByTestId` is the last resort;
  CSS/XPath never.
- One user path per file; do not chain scenarios.
- A test that passed after a retry goes to the flaky list automatically; see the
  `flaky-triage` skill. Never raise a timeout without naming the source of instability in
  the commit.

## Runs

- Locally: iterate on the affected spec, then run the required suites before finishing
  behavior/test changes. Existing CI runs selected E2E after business integration and
  component checks, filters PRs by paths, and runs the complete suite on master pushes.
  There is no nightly job; do not claim one exists.
- E2E is never mutation-tested. Preserve the existing Playwright project dependencies and
  per-context IndexedDB isolation.

## Test levels in this repository

Read `e2e/README.md` before work. The directory name does not determine the level:

| Paths                                  | Level and ownership                                                                                                                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/**/*.feature`, `behavior/**` | Business integration through real application models and IndexedDB; no application UI. Gherkin step → check chains are allowed. Keep business specifications independent of screens, routes, copy and storage representation. |
| `journeys/**`                          | Selected full-system user journeys; preserve smoke prerequisites and destructive-operation confirmations.                                                                                                                     |
| `tests/**`, `touch/**`                 | Browser UI/platform checks, including layout, focus and touch; the journey-only restrictions above do not ban these existing lower-level checks.                                                                              |
| `updates/**`                           | Real release/service-worker transitions; keep lifecycle synchronization and owned test transport.                                                                                                                             |
| `.features-gen/**`                     | Generated output; regenerate with `yarn workspace @einbuergerungstest/e2e bddgen`, never edit.                                                                                                                                |

A browser context is fresh per business scenario. Do not substitute IndexedDB or Reatom
methods inside the responsibility being checked. Preserve no-retry journey settings. AAA
applies within focused steps; do not split meaningful multi-step business scenarios merely
to match unit-test syntax.

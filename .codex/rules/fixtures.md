---
paths:
  - '**/fixtures/**'
  - '**/*.fixture.{ts,js}'
  - '**/*.fixtures.{ts,js}'
  - '**/factories/**'
  - '**/seed*/**'
---

# Fixtures and test data

AGENTS.md §6 is the contract.

## Always a function

```ts
// never
export const paymentOkResponse = { status: 'ok', amount: 100 }

// always
const defaults = { status: 'ok', amount: 100, customer: { id: 'c-1' } } as const
export function makePaymentResponse(
  overrides: Partial<PaymentResponse> = {},
): PaymentResponse {
  return { ...structuredClone(defaults), ...overrides }
}
```

`structuredClone` because nested objects always appear eventually. `Object.freeze` forbids
mutation; cloning makes it safe — prefer safe. Do not optimise cloning until it is
measurably slow.

## Shape and truth

- The fixture reproduces the shape of what it replaces. Type it from the module's own type
  or from the service's OpenAPI/typings; do not derive the type from the fixture.
- For an external service, build the fixture from as many diverse real examples as you can
  get (normal, rejected, manual review, `null` fields). Describe the shape; never
  hard-code literals from the examples (`riskScore: 12`, a specific `reason`) into the
  type. A factory takes the varying parts as parameters.
- Fixtures generated from a real server: request twice, diff the responses, replace the
  unstable fields (ids, timestamps) with stable values in the factory.

## Usage

- A handful of typical fixtures (success / rejected / pending) with overrides. Not one
  personal fixture per test.
- Read values from the fixture in assertions (`expect(result.id).toBe(request.id)`) rather
  than re-typing what you saw inside it.
- Never mutate an imported fixture in a test. New variant = new call with overrides.
- IndexedDB seeding belongs in `e2e/behavior/fixtures` and the existing browser fixtures.
  Each scenario gets its own storage and model instances. A state the application could
  never produce is not an acceptable fixture.
- Reset shared state in `beforeEach` of the file that depends on it. `beforeAll` is for
  setup, not for reset. Duplicating the reset hook per file documents the dependency; do
  not centralise it into `globalSetup`.

Lint-rule fixtures under `packages/lint-rules/src/**/fixtures/**` are deliberately invalid
source inputs; do not apply runtime-test style rules to their contents.
